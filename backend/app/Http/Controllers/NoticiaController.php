<?php

namespace App\Http\Controllers;

use App\Models\Noticia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NoticiaController extends Controller
{
    public function index(): JsonResponse
    {
        $noticias = Noticia::orderBy('fecha', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($noticias);
    }

    public function indexPublicadas(): JsonResponse
    {
        $noticias = Noticia::where('estado', 'publicado')
            ->orderBy('fecha', 'desc')
            ->get();

        return response()->json($noticias);
    }

    public function store(Request $request): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $data = $request->validate([
            'titulo'      => 'required|string|max:255',
            'categoria'   => 'required|in:noticia,evento,congreso,feria,aviso',
            'estado'      => 'required|in:publicado,borrador',
            'fecha'       => 'required|date',
            'descripcion' => 'required|string',
            'imagen'      => 'nullable|url|max:500',
        ]);

        $noticia = Noticia::create([...$data, 'user_id' => $request->user()->id]);

        return response()->json($noticia, 201);
    }

    public function update(Request $request, Noticia $noticia): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $data = $request->validate([
            'titulo'      => 'sometimes|string|max:255',
            'categoria'   => 'sometimes|in:noticia,evento,congreso,feria,aviso',
            'estado'      => 'sometimes|in:publicado,borrador',
            'fecha'       => 'sometimes|date',
            'descripcion' => 'sometimes|string',
            'imagen'      => 'nullable|url|max:500',
        ]);

        $noticia->update($data);

        return response()->json($noticia);
    }

    public function destacar(Request $request, Noticia $noticia): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $eraDestacada = $noticia->destacada;

        Noticia::where('destacada', true)->update(['destacada' => false]);

        if (!$eraDestacada) {
            $noticia->update(['destacada' => true]);
        }

        return response()->json($noticia->fresh());
    }

    public function destroy(Request $request, Noticia $noticia): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $noticia->delete();

        return response()->json(null, 204);
    }
}
