<?php

namespace App\Http\Controllers;

use App\Models\ArchivoPersonal;
use App\Models\CarpetaPersonal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ArchivoPersonalController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $carpetaId = $request->query('carpeta_id');

        $archivos = ArchivoPersonal::where('user_id', $request->user()->id)
            ->where('carpeta_id', $carpetaId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($archivos);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nombre'     => 'required|string|max:255',
            'archivo'    => 'required|file|max:20480',
            'carpeta_id' => 'nullable|integer|exists:carpetas_personales,id',
        ], [
            'archivo.max'      => 'El archivo no puede pesar más de 20 MB.',
            'archivo.required' => 'Debes seleccionar un archivo.',
            'archivo.file'     => 'El archivo subido no es válido.',
        ]);

        if (!empty($data['carpeta_id'])) {
            $carpeta = CarpetaPersonal::where('user_id', $request->user()->id)->find($data['carpeta_id']);
            abort_unless($carpeta, 403);
        }

        $file = $request->file('archivo');
        $path = $file->store('archivos_personales/' . $request->user()->id, 'local');

        $archivo = ArchivoPersonal::create([
            'user_id'         => $request->user()->id,
            'carpeta_id'      => $data['carpeta_id'] ?? null,
            'nombre'          => $data['nombre'],
            'archivo'         => $path,
            'archivo_nombre'  => $file->getClientOriginalName(),
            'archivo_tamanio' => $file->getSize(),
        ]);

        return response()->json($archivo, 201);
    }

    public function update(Request $request, ArchivoPersonal $archivo): JsonResponse
    {
        abort_unless($archivo->user_id === $request->user()->id, 403);

        $data = $request->validate([
            'nombre'     => 'sometimes|string|max:255',
            'carpeta_id' => 'nullable|integer|exists:carpetas_personales,id',
        ]);

        if (array_key_exists('carpeta_id', $data) && $data['carpeta_id']) {
            $carpeta = CarpetaPersonal::where('user_id', $request->user()->id)->find($data['carpeta_id']);
            abort_unless($carpeta, 403);
        }

        $archivo->update($data);

        return response()->json($archivo);
    }

    public function download(Request $request, ArchivoPersonal $archivo): BinaryFileResponse
    {
        abort_unless($archivo->user_id === $request->user()->id, 403);

        $path = Storage::disk('local')->path($archivo->archivo);

        abort_unless(file_exists($path), 404);

        return response()->download($path, $archivo->archivo_nombre);
    }

    public function destroy(Request $request, ArchivoPersonal $archivo): JsonResponse
    {
        abort_unless($archivo->user_id === $request->user()->id, 403);

        Storage::disk('local')->delete($archivo->archivo);
        $archivo->delete();

        return response()->json(null, 204);
    }
}
