<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EvaluacionSamr extends Model
{
    protected $table = 'evaluaciones_samr';

    protected $fillable = ['user_id', 'preguntas_ids', 'respuestas', 'puntaje', 'total'];

    protected $casts = [
        'preguntas_ids' => 'array',
        'respuestas'    => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
