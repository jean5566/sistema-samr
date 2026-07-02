<?php

namespace App\Http\Controllers;

use App\Models\Documento;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class DocumentoController extends Controller
{
    public function index(): JsonResponse
    {
        $docs = Documento::with('autor:id,name')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($docs);
    }

    public function download(Documento $documento): BinaryFileResponse
    {
        $path = Storage::disk('public')->path($documento->archivo);

        abort_unless(file_exists($path), 404);

        return response()->download($path, $documento->archivo_nombre);
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
            'tipo'        => 'required|string|max:100',
            'acceso'      => 'required|in:publico,interno',
            'descripcion' => 'nullable|string',
            'archivo'     => 'required|file|mimetypes:application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/octet-stream|max:102400',
        ], [
            'archivo.mimetypes' => 'El archivo debe ser PDF, Word (.doc, .docx) o Excel (.xls, .xlsx).',
            'archivo.max'       => 'El archivo no puede pesar más de 100 MB.',
            'archivo.required'  => 'Debes seleccionar un archivo.',
            'archivo.file'      => 'El archivo subido no es válido.',
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
            'tipo'        => 'sometimes|string|max:100',
            'acceso'      => 'sometimes|in:publico,interno',
            'descripcion' => 'nullable|string',
            'archivo'     => 'sometimes|file|mimetypes:application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/octet-stream|max:102400',
        ], [
            'archivo.mimetypes' => 'El archivo debe ser PDF, Word (.doc, .docx) o Excel (.xls, .xlsx).',
            'archivo.max'       => 'El archivo no puede pesar más de 100 MB.',
            'archivo.file'      => 'El archivo subido no es válido.',
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
