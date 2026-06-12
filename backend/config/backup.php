<?php

use App\Models\Docente;
use App\Models\Documento;

return [

    /*
    |--------------------------------------------------------------------------
    | Carpeta de destino de los backups
    |--------------------------------------------------------------------------
    */

    'destination' => storage_path('app/backups'),

    /*
    |--------------------------------------------------------------------------
    | Retención
    |--------------------------------------------------------------------------
    |
    | Cantidad de días que se conservan los backups antes de que el comando
    | "backup:clean" los elimine.
    |
    */

    'retention_days' => env('BACKUP_RETENTION_DAYS', 14),

    /*
    |--------------------------------------------------------------------------
    | mysqldump
    |--------------------------------------------------------------------------
    |
    | Ruta al binario de mysqldump. En Linux normalmente basta con "mysqldump"
    | (ya está en el PATH). En Windows/Laragon hay que apuntar al .exe.
    |
    */

    'mysqldump_path' => env('MYSQLDUMP_PATH', 'mysqldump'),

    /*
    |--------------------------------------------------------------------------
    | Limpieza de archivos huérfanos
    |--------------------------------------------------------------------------
    |
    | Carpetas dentro del disco "public" que se revisan en busca de archivos
    | que ya no estén referenciados por ningún registro en la base de datos.
    | Formato: 'carpeta' => [Modelo::class, 'columna'].
    |
    */

    'orphan_targets' => [
        'docentes' => [Docente::class, 'foto'],
        'documentos' => [Documento::class, 'archivo'],
    ],

];
