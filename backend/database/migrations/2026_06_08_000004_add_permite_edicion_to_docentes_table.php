<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('docentes', function (Blueprint $table) {
            $table->boolean('permite_edicion_estudiantes')->default(false)->after('bio');
        });
    }

    public function down(): void
    {
        Schema::table('docentes', function (Blueprint $table) {
            $table->dropColumn('permite_edicion_estudiantes');
        });
    }
};
