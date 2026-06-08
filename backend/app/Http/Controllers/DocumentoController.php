<?php

namespace App\Http\Controllers;

use App\Models\Documento;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentoController extends Controller
{
    public function index(): JsonResponse
    {
        $docs = Documento::with('autor:id,name')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($docs);
    }

    public function indexPublicos(): JsonResponse
    {
        $docs = Documento::with('autor:id,name')
            ->where('acceso', 'publico')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($docs);
    }

    public function store(Request $request): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $data = $request->validate([
            'nombre'      => 'required|string|max:255',
            'tipo'        => 'required|in:planificacion,curriculo,reglamento,resolucion,otro',
            'acceso'      => 'required|in:publico,interno',
            'descripcion' => 'nullable|string',
            'archivo'     => 'required|file|mimes:pdf,doc,docx,xls,xlsx|max:20480',
        ]);

        $file   = $request->file('archivo');
        $path   = $file->store('documentos', 'public');

        $doc = Documento::create([
            'user_id'         => $request->user()->id,
            'nombre'          => $data['nombre'],
            'tipo'            => $data['tipo'],
            'acceso'          => $data['acceso'],
            'descripcion'     => $data['descripcion'] ?? null,
            'archivo'         => $path,
            'archivo_nombre'  => $file->getClientOriginalName(),
            'archivo_tamanio' => $file->getSize(),
        ]);

        return response()->json($doc->load('autor:id,name'), 201);
    }

    public function update(Request $request, Documento $documento): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $data = $request->validate([
            'nombre'      => 'sometimes|string|max:255',
            'tipo'        => 'sometimes|in:planificacion,curriculo,reglamento,resolucion,otro',
            'acceso'      => 'sometimes|in:publico,interno',
            'descripcion' => 'nullable|string',
            'archivo'     => 'sometimes|file|mimes:pdf,doc,docx,xls,xlsx|max:20480',
        ]);

        if ($request->hasFile('archivo')) {
            Storage::disk('public')->delete($documento->archivo);
            $file = $request->file('archivo');
            $data['archivo']         = $file->store('documentos', 'public');
            $data['archivo_nombre']  = $file->getClientOriginalName();
            $data['archivo_tamanio'] = $file->getSize();
        }

        $documento->update($data);

        return response()->json($documento->fresh()->load('autor:id,name'));
    }

    public function destroy(Request $request, Documento $documento): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        Storage::disk('public')->delete($documento->archivo);
        $documento->delete();

        return response()->json(null, 204);
    }
}
