<?php

namespace App\Console\Commands;

use DateTime;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class BackupClean extends Command
{
    protected $signature = 'backup:clean';

    protected $description = 'Elimina los backups más antiguos que la retención configurada';

    public function handle(): int
    {
        $destination = config('backup.destination');
        $retentionDays = (int) config('backup.retention_days');

        if (! File::isDirectory($destination)) {
            $this->info('No hay backups que limpiar.');

            return self::SUCCESS;
        }

        $cutoff = now()->subDays($retentionDays);
        $deleted = 0;

        foreach (File::directories($destination) as $dir) {
            $folderName = basename($dir);
            $date = DateTime::createFromFormat('Y-m-d_His', $folderName);

            if ($date === false || $date->getTimestamp() >= $cutoff->getTimestamp()) {
                continue;
            }

            File::deleteDirectory($dir);
            $deleted++;
            $this->line("Eliminado: {$folderName}");
        }

        $this->info("Backups eliminados: {$deleted}. Retención: {$retentionDays} día(s).");

        return self::SUCCESS;
    }
}
