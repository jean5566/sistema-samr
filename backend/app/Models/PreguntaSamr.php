<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PreguntaSamr extends Model
{
    protected $table = 'preguntas_samr';

    protected $fillable = ['enunciado', 'opciones', 'respuesta_correcta', 'nivel', 'activa'];

    protected $casts = [
        'opciones' => 'array',
        'activa'   => 'boolean',
    ];

    public function sugerencias()
    {
        return $this->hasMany(SugerenciaSamr::class, 'pregunta_id');
    }
}
