<?php

namespace App\Http\Controllers;

use App\Models\EvaluacionSamr;
use App\Models\PreguntaSamr;
use App\Models\SugerenciaSamr;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EvaluacionSamrController extends Controller
{
    public function preguntas(): JsonResponse
    {
        $preguntas = PreguntaSamr::where('activa', true)
            ->select('id', 'enunciado', 'opciones', 'nivel')
            ->get();

        return response()->json($preguntas);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'preguntas_ids'   => 'required|array|min:1',
            'preguntas_ids.*' => 'integer|exists:preguntas_samr,id',
            'respuestas'      => 'required|array',
        ]);

        $preguntas = PreguntaSamr::whereIn('id', $data['preguntas_ids'])->get()->keyBy('id');
        $puntaje   = 0;

        foreach ($data['preguntas_ids'] as $id) {
            $pregunta = $preguntas[$id] ?? null;
            if (!$pregunta) continue;

            $respuesta = $data['respuestas'][$id] ?? null;
            if ((int) $respuesta === (int) $pregunta->respuesta_correcta) {
                $puntaje++;
            }
        }

        $evaluacion = EvaluacionSamr::create([
            'user_id'       => $request->user()->id,
            'preguntas_ids' => $data['preguntas_ids'],
            'respuestas'    => $data['respuestas'],
            'puntaje'       => $puntaje,
            'total'         => count($data['preguntas_ids']),
        ]);

        $resultado = [];
        foreach ($data['preguntas_ids'] as $id) {
            $pregunta = $preguntas[$id] ?? null;
            if (!$pregunta) continue;
            $resultado[$id] = [
                'correcta'   => (int) $pregunta->respuesta_correcta,
                'respondida' => isset($data['respuestas'][$id]) ? (int) $data['respuestas'][$id] : null,
                'acertada'   => isset($data['respuestas'][$id]) && (int) $data['respuestas'][$id] === (int) $pregunta->respuesta_correcta,
            ];
        }

        return response()->json([
            'puntaje'   => $puntaje,
            'total'     => count($data['preguntas_ids']),
            'resultado' => $resultado,
        ], 201);
    }

    public function sugerir(Request $request): JsonResponse
    {
        $data = $request->validate([
            'pregunta_id' => 'required|integer|exists:preguntas_samr,id',
            'sugerencia'  => 'required|string|max:1000',
            'motivo'      => 'nullable|string|max:500',
        ]);

        $sugerencia = SugerenciaSamr::create([
            'user_id'     => $request->user()->id,
            'pregunta_id' => $data['pregunta_id'],
            'sugerencia'  => $data['sugerencia'],
            'motivo'      => $data['motivo'] ?? null,
        ]);

        return response()->json($sugerencia, 201);
    }
}
