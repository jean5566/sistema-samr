<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluaciones_samr', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->json('preguntas_ids');
            $table->json('respuestas');
            $table->unsignedTinyInteger('puntaje');
            $table->unsignedTinyInteger('total');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluaciones_samr');
    }
};
