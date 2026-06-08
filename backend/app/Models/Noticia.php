<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Noticia extends Model
{
    protected $fillable = [
        'user_id',
        'titulo',
        'categoria',
        'estado',
        'fecha',
        'descripcion',
        'imagen',
        'destacada',
    ];

    protected function casts(): array
    {
        return [
            'fecha'      => 'date',
            'destacada'  => 'boolean',
        ];
    }

    public function autor()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
