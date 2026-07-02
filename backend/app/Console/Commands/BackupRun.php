<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Symfony\Component\Process\Process;

class BackupRun extends Command
{
    protected $signature = 'backup:run';

    protected $description = 'Genera un backup de la base de datos y de storage/app/public';

    public function handle(): int
    {
        $destination = config('backup.destination').'/'.now()->format('Y-m-d_His');

        File::ensureDirectoryExists($destination);

        $this->backupDatabase($destination);
        $this->backupStorage($destination);

        $this->info("Backup creado en: {$destination}");

        return self::SUCCESS;
    }

    private function backupDatabase(string $destination): void
    {
        if (config('database.default') !== 'mysql') {
            $this->warn('La conexión por defecto no es mysql; se omite el dump de la base de datos.');

            return;
        }

        $connection = config('database.connections.mysql');
        $sqlPath = "{$destination}/database.sql";

        $process = new Process([
            config('backup.mysqldump_path'),
            '--host='.$connection['host'],
            '--port='.$connection['port'],
            '--user='.$connection['username'],
            '--single-transaction',
            '--routines',
            '--skip-comments',
            $connection['database'],
        ]);

        $process->setEnv(['MYSQL_PWD' => $connection['password']]);
        $process->setTimeout(600);

        $process->run(function ($type, $buffer) use ($sqlPath) {
            if ($type === Process::OUT) {
                File::append($sqlPath, $buffer);
            }
        });

        if (! $process->isSuccessful() || ! File::exists($sqlPath)) {
            $this->error('Falló el dump de la base de datos: '.$process->getErrorOutput());

            return;
        }

        File::put("{$sqlPath}.gz", gzencode(File::get($sqlPath), 9));
        File::delete($sqlPath);

        $this->info('Base de datos respaldada en database.sql.gz');
    }

    private function backupStorage(string $destination): void
    {
        $publicPath = storage_path('app/public');

        if (! File::isDirectory($publicPath)) {
            return;
        }

        $archivePath = "{$destination}/storage-public.tar.gz";

        $process = new Process([
            'tar', '--force-local', '-czf', $archivePath, '-C', dirname($publicPath), basename($publicPath),
        ]);

        $process->setTimeout(600);
        $process->run();

        if (! $process->isSuccessful()) {
            $this->error('Falló el backup de archivos: '.$process->getErrorOutput());

            return;
        }

        $this->info('Archivos respaldados en storage-public.tar.gz');
    }
}
