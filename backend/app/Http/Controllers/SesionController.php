<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SesionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $currentId = $request->user()->currentAccessToken()->id;

        $sesiones = $request->user()->tokens()
            ->orderByDesc('last_used_at')
            ->get()
            ->map(fn($t) => [
                'id'           => $t->id,
                'user_agent'   => $t->user_agent,
                'ip_address'   => $t->ip_address,
                'last_used_at' => $t->last_used_at,
                'created_at'   => $t->created_at,
                'es_actual'    => $t->id === $currentId,
            ]);

        return response()->json($sesiones);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $currentId = $request->user()->currentAccessToken()->id;

        if ($id === $currentId) {
            return response()->json(['message' => 'No puedes revocar la sesión actual desde aquí.'], 403);
        }

        $request->user()->tokens()->where('id', $id)->delete();

        return response()->json(['ok' => true]);
    }

    public function destroyOtras(Request $request): JsonResponse
    {
        $currentId = $request->user()->currentAccessToken()->id;

        $request->user()->tokens()->where('id', '!=', $currentId)->delete();

        return response()->json(['ok' => true]);
    }
}
