<?php

namespace App\Http\Controllers;

use App\Models\ArchivoPersonal;
use App\Models\CarpetaPersonal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CarpetaPersonalController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $parentId = $request->query('parent_id');

        $carpetas = CarpetaPersonal::where('user_id', $request->user()->id)
            ->where('parent_id', $parentId)
            ->withCount('archivos')
            ->orderBy('nombre')
            ->get();

        return response()->json($carpetas);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nombre'    => 'required|string|max:255',
            'parent_id' => 'nullable|integer|exists:carpetas_personales,id',
        ]);

        if (!empty($data['parent_id'])) {
            $padre = CarpetaPersonal::where('user_id', $request->user()->id)->find($data['parent_id']);
            abort_unless($padre, 403);
        }

        $carpeta = CarpetaPersonal::create([
            'user_id'   => $request->user()->id,
            'parent_id' => $data['parent_id'] ?? null,
            'nombre'    => $data['nombre'],
        ]);

        return response()->json($carpeta, 201);
    }

    public function update(Request $request, CarpetaPersonal $carpeta): JsonResponse
    {
        abort_unless($carpeta->user_id === $request->user()->id, 403);

        $data = $request->validate([
            'nombre' => 'required|string|max:255',
        ]);

        $carpeta->update($data);

        return response()->json($carpeta);
    }

    public function destroy(Request $request, CarpetaPersonal $carpeta): JsonResponse
    {
        abort_unless($carpeta->user_id === $request->user()->id, 403);

        $idsCarpetas = $this->idsConDescendientes($carpeta);

        ArchivoPersonal::whereIn('carpeta_id', $idsCarpetas)
            ->get()
            ->each(fn (ArchivoPersonal $archivo) => Storage::disk('local')->delete($archivo->archivo));

        $carpeta->delete();

        return response()->json(null, 204);
    }

    private function idsConDescendientes(CarpetaPersonal $carpeta): array
    {
        $ids = [$carpeta->id];
        foreach ($carpeta->subcarpetas as $hija) {
            $ids = array_merge($ids, $this->idsConDescendientes($hija));
        }
        return $ids;
    }
}
