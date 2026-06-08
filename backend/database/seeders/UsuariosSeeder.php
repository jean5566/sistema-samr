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
                'name'     => 'Administrador UNESUM',
                'email'    => 'admin@unesum.edu.ec',
                'password' => Hash::make('admin123'),
                'role'     => 'admin',
            ],
        );

        // Docente
        $docente = User::updateOrCreate(
            ['email' => 'c.mendoza@unesum.edu.ec'],
            [
                'name'     => 'Dr. Carlos Mendoza',
                'email'    => 'c.mendoza@unesum.edu.ec',
                'password' => Hash::make('docente123'),
                'role'     => 'docente',
            ],
        );

        Docente::updateOrCreate(
            ['user_id' => $docente->id],
            [
                'user_id'  => $docente->id,
                'nombre'   => 'Dr. Carlos Mendoza',
                'titulo'   => 'Doctor en Ciencias Informáticas',
                'area'     => 'Inteligencia Artificial',
                'email'    => 'c.mendoza@unesum.edu.ec',
                'telefono' => '+593 99 123 4567',
                'bio'      => 'Docente investigador con 12 años de experiencia en el área de Inteligencia Artificial y Machine Learning.',
            ],
        );

        // Estudiante
        User::updateOrCreate(
            ['email' => 'j.garcia@unesum.edu.ec'],
            [
                'name'     => 'Juan García',
                'email'    => 'j.garcia@unesum.edu.ec',
                'password' => Hash::make('estudiante123'),
                'role'     => 'estudiante',
            ],
        );
    }
}
