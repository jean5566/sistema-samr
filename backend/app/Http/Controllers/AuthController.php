<?php

namespace App\Http\Controllers;

use App\Models\Configuracion;
use App\Models\Docente;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

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
            'password'              => 'required|string|min:6|confirmed',
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

        if (!Auth::attempt($credentials)) {
            return response()->json(['message' => 'Credenciales incorrectas.'], 401);
        }

        $user = Auth::user();

        if ($user->estado === 'pendiente') {
            Auth::logout();
            return response()->json(['message' => 'Tu cuenta está pendiente de aprobación por el administrador.', 'estado' => 'pendiente'], 403);
        }

        if ($user->estado === 'rechazado') {
            Auth::logout();
            return response()->json(['message' => 'Tu cuenta ha sido rechazada. Contacta al administrador.', 'estado' => 'rechazado'], 403);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => [
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
