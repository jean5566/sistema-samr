<?php

namespace Database\Seeders;

use App\Models\Categoria;
use Illuminate\Database\Seeder;

class CategoriasSeeder extends Seeder
{
    public function run(): void
    {
        $cats = [
            // Noticias
            ['nombre' => 'Noticia',              'slug' => 'noticia',      'modulo' => 'noticias',   'color' => 'blue'],
            ['nombre' => 'Evento Académico',     'slug' => 'evento',       'modulo' => 'noticias',   'color' => 'indigo'],
            ['nombre' => 'Congreso',             'slug' => 'congreso',     'modulo' => 'noticias',   'color' => 'purple'],
            ['nombre' => 'Feria Tecnológica',    'slug' => 'feria',        'modulo' => 'noticias',   'color' => 'cyan'],
            ['nombre' => 'Aviso Institucional',  'slug' => 'aviso',        'modulo' => 'noticias',   'color' => 'amber'],

            // Documentos
            ['nombre' => 'Planificación',        'slug' => 'planificacion','modulo' => 'documentos', 'color' => 'blue'],
            ['nombre' => 'Rediseño Curricular',  'slug' => 'curriculo',    'modulo' => 'documentos', 'color' => 'emerald'],
            ['nombre' => 'Reglamento',           'slug' => 'reglamento',   'modulo' => 'documentos', 'color' => 'purple'],
            ['nombre' => 'Resolución',           'slug' => 'resolucion',   'modulo' => 'documentos', 'color' => 'amber'],
            ['nombre' => 'Otro',                 'slug' => 'otro',         'modulo' => 'documentos', 'color' => 'gray'],
        ];

        foreach ($cats as $cat) {
            Categoria::updateOrCreate(
                ['slug' => $cat['slug'], 'modulo' => $cat['modulo']],
                $cat
            );
        }
    }
}
