<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('preguntas_samr', function (Blueprint $table) {
            $table->id();
            $table->text('enunciado');
            $table->json('opciones');
            $table->unsignedTinyInteger('respuesta_correcta');
            $table->char('nivel', 1); // S, A, M, R
            $table->boolean('activa')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('preguntas_samr');
    }
};
