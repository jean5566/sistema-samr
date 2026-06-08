<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Documento extends Model
{
    protected $fillable = [
        'user_id',
        'nombre',
        'tipo',
        'acceso',
        'descripcion',
        'archivo',
        'archivo_nombre',
        'archivo_tamanio',
    ];

    protected $appends = ['archivo_url'];

    public function getArchivoUrlAttribute(): ?string
    {
        return $this->archivo ? Storage::disk('public')->url($this->archivo) : null;
    }

    public function autor()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
