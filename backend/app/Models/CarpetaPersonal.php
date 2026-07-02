<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CarpetaPersonal extends Model
{
    protected $table = 'carpetas_personales';

    protected $fillable = [
        'user_id',
        'parent_id',
        'nombre',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function padre()
    {
        return $this->belongsTo(CarpetaPersonal::class, 'parent_id');
    }

    public function subcarpetas()
    {
        return $this->hasMany(CarpetaPersonal::class, 'parent_id');
    }

    public function archivos()
    {
        return $this->hasMany(ArchivoPersonal::class, 'carpeta_id');
    }
}
