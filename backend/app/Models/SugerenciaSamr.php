<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SugerenciaSamr extends Model
{
    protected $table = 'sugerencias_samr';

    protected $fillable = ['user_id', 'pregunta_id', 'sugerencia', 'motivo', 'estado'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function pregunta()
    {
        return $this->belongsTo(PreguntaSamr::class, 'pregunta_id');
    }
}
