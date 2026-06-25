<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('carpetas_personales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('carpetas_personales')->cascadeOnDelete();
            $table->string('nombre');
            $table->timestamps();
        });

        Schema::table('archivos_personales', function (Blueprint $table) {
            $table->foreignId('carpeta_id')->nullable()->after('user_id')->constrained('carpetas_personales')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('archivos_personales', function (Blueprint $table) {
            $table->dropConstrainedForeignId('carpeta_id');
        });

        Schema::dropIfExists('carpetas_personales');
    }
};
