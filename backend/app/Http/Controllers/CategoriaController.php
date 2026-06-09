<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoriaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Categoria::orderBy('nombre');

        if ($request->filled('modulo')) {
            $query->where('modulo', $request->modulo);
        }

        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $data = $request->validate([
            'nombre' => 'required|string|max:100',
            'modulo' => 'required|in:noticias,documentos',
            'color'  => 'required|string|max:50',
        ]);

        $cat = Categoria::create($data);

        return response()->json($cat, 201);
    }

    public function update(Request $request, Categoria $categoria): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $data = $request->validate([
            'nombre' => 'sometimes|string|max:100',
            'color'  => 'sometimes|string|max:50',
        ]);

        $categoria->update($data);

        return response()->json($categoria);
    }

    public function destroy(Request $request, Categoria $categoria): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $categoria->delete();

        return response()->json(null, 204);
    }
}
