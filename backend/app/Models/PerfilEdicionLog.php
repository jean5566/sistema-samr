<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Docente;

class PerfilEdicionLog extends Model
{
    protected $table    = 'perfil_ediciones_log';
    protected $fillable = ['user_id', 'docente_id', 'cambios'];
    protected $casts    = ['cambios' => 'array'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function docente()
    {
        return $this->belongsTo(Docente::class);
    }
}
