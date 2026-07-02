<?php

namespace App\Http\Controllers;

use App\Models\Docente;
use App\Models\PerfilEdicionLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class EstudianteController extends Controller
{
    public function updatePerfil(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'name'     => 'sometimes|string|max:255',
            'email'    => "sometimes|email|unique:users,email,{$user->id}",
            'password' => 'sometimes|nullable|string|min:6',
        ]);

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return response()->json($user->refresh());
    }

    public function updateDocentePerfil(Request $request, Docente $docente): JsonResponse
    {
        $user = $request->user();
        if ($user->role !== 'estudiante') {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        if (!$docente->permite_edicion_estudiantes) {
            return response()->json(['message' => 'Este docente no ha habilitado la edición de su perfil.'], 403);
        }

        $data = $request->validate([
            'nombre'   => 'sometimes|string|max:150',
            'titulo'   => 'sometimes|string|max:150',
            'area'     => 'sometimes|string|max:100',
            'telefono' => 'nullable|string|max:30',
            'bio'      => 'nullable|string',
        ]);

        $cambios = [];
        foreach ($data as $campo => $nuevo) {
            $anterior = $docente->$campo;
            if ((string) $nuevo !== (string) ($anterior ?? '')) {
                $cambios[$campo] = ['anterior' => $anterior, 'nuevo' => $nuevo];
            }
        }

        $docente->update($data);
        $docente->refresh();

        if (!empty($cambios)) {
            PerfilEdicionLog::create([
                'user_id'    => $user->id,
                'docente_id' => $docente->id,
                'cambios'    => $cambios,
            ]);
        }

        return response()->json($docente);
    }
}
