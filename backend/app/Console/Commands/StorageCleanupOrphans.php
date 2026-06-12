<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class StorageCleanupOrphans extends Command
{
    protected $signature = 'storage:cleanup-orphans {--force : Elimina los archivos en lugar de solo listarlos}';

    protected $description = 'Elimina archivos del disco "public" que ya no están referenciados en la base de datos';

    public function handle(): int
    {
        $disk = Storage::disk('public');
        $force = $this->option('force');
        $totalOrphans = 0;

        foreach (config('backup.orphan_targets') as $directory => [$model, $column]) {
            $referenced = array_flip(
                $model::query()->whereNotNull($column)->pluck($column)->all()
            );

            foreach ($disk->files($directory) as $file) {
                if (isset($referenced[$file])) {
                    continue;
                }

                $totalOrphans++;

                if ($force) {
                    $disk->delete($file);
                    $this->line("Eliminado: {$file}");
                } else {
                    $this->line("Huérfano: {$file}");
                }
            }
        }

        if ($totalOrphans === 0) {
            $this->info('No se encontraron archivos huérfanos.');
        } elseif (! $force) {
            $this->warn("{$totalOrphans} archivo(s) huérfano(s) encontrados. Ejecuta con --force para eliminarlos.");
        } else {
            $this->info("{$totalOrphans} archivo(s) huérfano(s) eliminados.");
        }

        return self::SUCCESS;
    }
}
