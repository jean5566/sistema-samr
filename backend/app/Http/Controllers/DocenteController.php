<?php

namespace App\Http\Controllers;

use App\Models\Docente;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocenteController extends Controller
{
    public function index(): JsonResponse
    {
        $docentes = Docente::whereHas('user', fn($q) => $q->where('estado', 'activo'))
            ->orWhereNull('user_id')
            ->get();

        return response()->json($docentes)
            ->header('Cache-Control', 'no-store, no-cache, must-revalidate')
            ->header('Pragma', 'no-cache');
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nombre'   => 'required|string|max:150',
            'titulo'   => 'required|string|max:150',
            'area'     => 'required|string|max:100',
            'email'    => 'required|email|unique:docentes,email',
            'telefono' => 'nullable|string|max:30',
            'bio'      => 'nullable|string',
            'foto'     => 'nullable|image|max:5120',
        ]);

        if ($request->hasFile('foto')) {
            $data['foto'] = $request->file('foto')->store('docentes', 'public');
        }

        $docente = Docente::create($data);

        return response()->json($docente, 201);
    }

    public function show(Docente $docente): JsonResponse
    {
        return response()->json($docente);
    }

    public function update(Request $request, Docente $docente): JsonResponse
    {
        $data = $request->validate([
            'nombre'                      => 'sometimes|string|max:150',
            'titulo'                      => 'sometimes|nullable|string|max:150',
            'area'                        => 'sometimes|nullable|string|max:100',
            'email'                       => 'sometimes|email|unique:docentes,email,'.$docente->id,
            'telefono'                    => 'nullable|string|max:30',
            'bio'                         => 'nullable|string',
            'foto'                        => 'nullable|image|max:5120',
            'permite_edicion_estudiantes' => 'sometimes|boolean',
        ]);

        if ($request->hasFile('foto')) {
            if ($docente->foto) {
                Storage::disk('public')->delete($docente->foto);
            }
            $data['foto'] = $request->file('foto')->store('docentes', 'public');
        }

        $docente->update($data);

        // Sincronizar nombre y email en users
        if ($docente->user_id) {
            $userFields = [];
            if (isset($data['nombre'])) $userFields['name']  = $data['nombre'];
            if (isset($data['email']))  $userFields['email'] = $data['email'];
            if ($userFields) $docente->user()->update($userFields);
        }

        $docente->refresh();

        return response()->json($docente);
    }

    public function destroy(Docente $docente): JsonResponse
    {
        if ($docente->foto) {
            Storage::disk('public')->delete($docente->foto);
        }

        $docente->delete();

        return response()->json(null, 204);
    }

    public function updateFoto(Request $request, Docente $docente): JsonResponse
    {
        $request->validate(
            ['foto' => 'required|image|max:5120'],
            ['foto.max' => 'La foto no debe superar los 5 MB.'],
        );

        if ($docente->foto) {
            Storage::disk('public')->delete($docente->foto);
        }

        $path = $request->file('foto')->store('docentes', 'public');
        $docente->update(['foto' => $path]);
        $docente->refresh();

        return response()->json([
            'foto'     => $docente->foto,
            'foto_url' => $docente->foto_url,
        ]);
    }
}
