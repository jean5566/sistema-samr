<?php

namespace App\Http\Controllers;

use App\Models\Configuracion;
use App\Models\Docente;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function registroEstado(): JsonResponse
    {
        $val = Configuracion::where('clave', 'registro_habilitado')->value('valor');
        return response()->json(['habilitado' => $val === '1']);
    }

    public function register(Request $request): JsonResponse
    {
        $val = Configuracion::where('clave', 'registro_habilitado')->value('valor');
        if ($val !== '1') {
            return response()->json(['message' => 'El registro de nuevos usuarios está deshabilitado.'], 403);
        }

        $data = $request->validate([
            'name'                  => 'required|string|max:255',
            'email'                 => 'required|email|unique:users,email',
            'password'              => 'required|string|min:9|confirmed',
            'role'                  => 'required|in:docente,estudiante',
        ]);

        User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'role'     => $data['role'],
            'password' => Hash::make($data['password']),
            'estado'   => 'pendiente',
        ]);

        return response()->json(['message' => 'Registro enviado. Espera la aprobación del administrador.'], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $key         = 'login:' . Str::lower($request->input('email', ''));
        $maxIntentos = (int) (Configuracion::where('clave', 'intentos_login')->value('valor') ?? 5);

        if (RateLimiter::tooManyAttempts($key, $maxIntentos)) {
            $seconds = RateLimiter::availableIn($key);
            return response()->json([
                'message' => "Demasiados intentos fallidos. Intenta de nuevo en {$seconds} segundos.",
            ], 429);
        }

        if (!Auth::attempt($credentials)) {
            RateLimiter::hit($key, 600);
            $restantes = max(0, $maxIntentos - RateLimiter::attempts($key));
            $msg = $restantes > 0
                ? "Credenciales incorrectas. Intentos restantes: {$restantes}."
                : 'Credenciales incorrectas.';
            return response()->json(['message' => $msg], 401);
        }

        RateLimiter::clear($key);

        $user = Auth::user();

        if ($user->estado === 'pendiente') {
            Auth::logout();
            return response()->json(['message' => 'Tu cuenta está pendiente de aprobación por el administrador.', 'estado' => 'pendiente'], 403);
        }

        if ($user->estado === 'rechazado') {
            Auth::logout();
            return response()->json(['message' => 'Tu cuenta ha sido rechazada. Contacta al administrador.', 'estado' => 'rechazado'], 403);
        }

        $sesion_anterior = $user->tokens()->exists();
        $user->tokens()->delete();

        $minutos  = (int) (Configuracion::where('clave', 'sesion_minutos')->value('valor') ?? 60);
        $newToken = $user->createToken('api-token');
        $newToken->accessToken->forceFill([
            'user_agent' => substr($request->userAgent() ?? '', 0, 500),
            'ip_address' => $request->ip(),
            'expires_at' => now()->addMinutes($minutos),
        ])->save();

        return response()->json([
            'token'           => $newToken->plainTextToken,
            'sesion_anterior' => $sesion_anterior,
            'user'            => [
                'id'      => $user->id,
                'name'    => $user->name,
                'email'   => $user->email,
                'role'    => $user->role,
                'docente' => $user->docente,
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('docente');

        if ($user->role === 'docente' && !$user->docente) {
            Docente::create([
                'user_id' => $user->id,
                'nombre'  => $user->name,
                'email'   => $user->email,
                'titulo'  => null,
                'area'    => null,
            ]);
            $user->load('docente');
        }

        return response()->json([
            'id'      => $user->id,
            'name'    => $user->name,
            'email'   => $user->email,
            'role'    => $user->role,
            'docente' => $user->docente,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Sesión cerrada.']);
    }
}
