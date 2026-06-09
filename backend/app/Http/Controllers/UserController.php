<?php

namespace App\Http\Controllers;

use App\Models\Docente;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    private function adminOnly(Request $request): bool
    {
        return $request->user()->role === 'admin';
    }

    public function index(Request $request): JsonResponse
    {
        if (!$this->adminOnly($request)) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $users = User::orderBy('created_at', 'desc')
            ->get()
            ->map(fn($u) => [
                'id'         => $u->id,
                'name'       => $u->name,
                'email'      => $u->email,
                'role'       => $u->role,
                'estado'     => $u->estado,
                'created_at' => $u->created_at,
            ]);

        return response()->json($users);
    }

    public function store(Request $request): JsonResponse
    {
        if (!$this->adminOnly($request)) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'role'     => 'required|in:admin,docente,estudiante',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'role'     => $data['role'],
            'password' => Hash::make($data['password']),
            'estado'   => 'activo',
        ]);

        if ($user->role === 'docente') {
            Docente::create([
                'user_id' => $user->id,
                'nombre'  => $user->name,
                'email'   => $user->email,
                'titulo'  => null,
                'area'    => null,
            ]);
        }

        return response()->json([
            'id'         => $user->id,
            'name'       => $user->name,
            'email'      => $user->email,
            'role'       => $user->role,
            'estado'     => $user->estado,
            'created_at' => $user->created_at,
        ], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        if (!$this->adminOnly($request)) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $data = $request->validate([
            'name'     => 'sometimes|string|max:255',
            'email'    => "sometimes|email|unique:users,email,{$user->id}",
            'role'     => 'sometimes|in:admin,docente,estudiante',
            'password' => 'sometimes|nullable|string|min:6',
        ]);

        if (isset($data['password']) && $data['password']) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $oldRole = $user->role;
        $user->update($data);
        $user->refresh();
        $user->load('docente');

        // Sincronizar con tabla docentes
        if ($user->role === 'docente') {
            if ($user->docente) {
                $docenteFields = [];
                if (isset($data['name']))  $docenteFields['nombre'] = $data['name'];
                if (isset($data['email'])) $docenteFields['email']  = $data['email'];
                if ($docenteFields) {
                    $user->docente->update($docenteFields);
                }
            } else {
                // Crear perfil si no existe
                Docente::create([
                    'user_id' => $user->id,
                    'nombre'  => $user->name,
                    'email'   => $user->email,
                    'titulo'  => null,
                    'area'    => null,
                ]);
            }
        }

        // Si el rol cambió desde docente, eliminar el perfil
        if ($oldRole === 'docente' && $user->role !== 'docente' && $user->docente) {
            $user->docente->delete();
        }

        return response()->json([
            'id'         => $user->id,
            'name'       => $user->name,
            'email'      => $user->email,
            'role'       => $user->role,
            'estado'     => $user->estado,
            'created_at' => $user->created_at,
        ]);
    }

    public function aprobar(Request $request, User $user): JsonResponse
    {
        if (!$this->adminOnly($request)) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }
        $user->update(['estado' => 'activo']);

        if ($user->role === 'docente' && !$user->docente) {
            Docente::create([
                'user_id' => $user->id,
                'nombre'  => $user->name,
                'email'   => $user->email,
                'titulo'  => null,
                'area'    => null,
            ]);
        }

        return response()->json(['ok' => true]);
    }

    public function rechazar(Request $request, User $user): JsonResponse
    {
        if (!$this->adminOnly($request)) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }
        $user->update(['estado' => 'rechazado']);
        return response()->json(['ok' => true]);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        if (!$this->adminOnly($request)) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'No puedes eliminar tu propia cuenta.'], 422);
        }

        $user->delete();

        return response()->json(null, 204);
    }
}
