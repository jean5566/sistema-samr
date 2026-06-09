<?php

namespace Database\Seeders;

use App\Models\Docente;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsuariosSeeder extends Seeder
{
    public function run(): void
    {
        // Administrador
        User::updateOrCreate(
            ['email' => 'admin@unesum.edu.ec'],
            [
                'name'     => 'TIC',
                'email'    => 'admin@unesum.edu.ec',
                'password' => Hash::make('admin123'),
                'role'     => 'admin',
            ],
        );

    }
}
