<?php

namespace App\Http\Controllers;

use App\Models\Documento;
use App\Models\Noticia;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StatsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        return response()->json([
            'estudiantes' => User::where('role', 'estudiante')->count(),
            'docentes'    => User::where('role', 'docente')->count(),
            'noticias'    => Noticia::where('estado', 'publicado')->count(),
            'documentos'  => Documento::count(),
        ]);
    }
}
