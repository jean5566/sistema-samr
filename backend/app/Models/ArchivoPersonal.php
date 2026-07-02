<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ArchivoPersonal extends Model
{
    protected $table = 'archivos_personales';

    protected $fillable = [
        'user_id',
        'carpeta_id',
        'nombre',
        'archivo',
        'archivo_nombre',
        'archivo_tamanio',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function carpeta()
    {
        return $this->belongsTo(CarpetaPersonal::class, 'carpeta_id');
    }
}
