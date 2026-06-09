<?php

namespace App\Http\Controllers;

use App\Models\Configuracion;
use App\Models\PerfilEdicionLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConfiguracionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $configs = Configuracion::all();
        $map = [];
        foreach ($configs as $c) {
            $map[$c->clave] = $c->valor;
        }
        return response()->json($map);
    }

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!in_array($user->role, ['admin', 'docente'])) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $data = $request->validate([
            'clave' => 'required|string|max:100',
            'valor' => 'required|string|max:255',
        ]);

        Configuracion::updateOrCreate(
            ['clave' => $data['clave']],
            ['valor' => $data['valor']]
        );

        return response()->json(['ok' => true]);
    }

    public function log(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!in_array($user->role, ['admin', 'docente'])) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $logs = PerfilEdicionLog::with(['user', 'docente'])
            ->orderBy('created_at', 'desc')
            ->limit(200)
            ->get()
            ->map(fn($l) => [
                'id'             => $l->id,
                'user_id'        => $l->user_id,
                'nombre'         => $l->user?->name,
                'email'          => $l->user?->email,
                'docente_id'     => $l->docente_id,
                'docente_nombre' => $l->docente?->nombre,
                'cambios'        => $l->cambios,
                'created_at'     => $l->created_at,
            ]);

        return response()->json($logs);
    }
}
