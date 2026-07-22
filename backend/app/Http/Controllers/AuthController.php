<?php

namespace App\Http\Controllers;

use App\Models\Configuracion;
use App\Models\Docente;
use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Auth\Passwords\PasswordBroker;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
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
            'password'              => [
                'required', 'string', 'min:9', 'confirmed',
                'regex:/^[A-ZÁÉÍÓÚÑ]/',
                'regex:/[0-9]/',
                'regex:/[^A-Za-z0-9]/',
            ],
            'role'                  => 'required|in:docente,estudiante',
        ], [
            'password.regex' => 'La contraseña debe empezar con mayúscula e incluir al menos un número y un carácter especial.',
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

        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            RateLimiter::hit($key, 600);
            $restantes = max(0, $maxIntentos - RateLimiter::attempts($key));
            $base      = !$user ? 'El correo no está registrado.' : 'La contraseña es incorrecta.';
            $msg       = $restantes > 0 ? "{$base} Intentos restantes: {$restantes}." : $base;
            return response()->json(['message' => $msg], 401);
        }

        RateLimiter::clear($key);

        Auth::login($user);

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

    public function forgotPassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => 'required|email',
        ]);

        $status = Password::sendResetLink(
            ['email' => $data['email']],
            fn ($user, $token) => $user->notify(new ResetPasswordNotification($token)),
        );

        return match ($status) {
            PasswordBroker::RESET_LINK_SENT => response()->json([
                'message' => 'Te enviamos un correo con las instrucciones para restablecer tu contraseña.',
            ]),
            PasswordBroker::RESET_THROTTLED => response()->json([
                'message' => 'Ya enviamos un enlace hace poco. Espera un momento antes de solicitar otro.',
            ], 429),
            default => response()->json([
                'message' => 'El correo no está registrado.',
            ], 404),
        };
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'token'                 => 'required|string',
            'email'                 => 'required|email',
            'password'              => 'required|string|min:9|confirmed',
        ]);

        $status = Password::reset(
            $data,
            function ($user, $password) {
                $user->forceFill(['password' => Hash::make($password)])->save();
                $user->tokens()->delete();
            },
        );

        if ($status === PasswordBroker::PASSWORD_RESET) {
            return response()->json(['message' => 'Tu contraseña se actualizó correctamente.']);
        }

        return response()->json([
            'message' => 'El enlace de recuperación no es válido o ha expirado.',
        ], 400);
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
