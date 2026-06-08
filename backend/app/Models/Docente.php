<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Docente extends Model
{
    protected $fillable = [
        'user_id',
        'nombre',
        'titulo',
        'area',
        'email',
        'telefono',
        'bio',
        'foto',
    ];

    protected $appends = ['foto_url'];

    public function getFotoUrlAttribute(): ?string
    {
        return $this->foto ? Storage::disk('public')->url($this->foto) : null;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
