<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documentos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('nombre');
            $table->enum('tipo', ['planificacion', 'curriculo', 'reglamento', 'resolucion', 'otro'])->default('otro');
            $table->enum('acceso', ['publico', 'interno'])->default('publico');
            $table->text('descripcion')->nullable();
            $table->string('archivo');
            $table->string('archivo_nombre');
            $table->unsignedBigInteger('archivo_tamanio')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documentos');
    }
};
