<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Categoria extends Model
{
    protected $fillable = ['nombre', 'slug', 'modulo', 'color'];

    protected static function booted(): void
    {
        static::creating(function (Categoria $cat) {
            if (empty($cat->slug)) {
                $base  = Str::slug($cat->nombre);
                $slug  = $base;
                $count = 1;
                while (static::where('modulo', $cat->modulo)->where('slug', $slug)->exists()) {
                    $slug = $base . '-' . ++$count;
                }
                $cat->slug = $slug;
            }
        });
    }
}
