<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('etudiants', function (Blueprint $table) {
            $table->dropForeign(['classe_id']);
            $table->unsignedBigInteger('classe_id')->nullable()->change();
            $table->foreign('classe_id')->references('id')->on('classes')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('etudiants', function (Blueprint $table) {
            $table->dropForeign(['classe_id']);
            $table->unsignedBigInteger('classe_id')->nullable(false)->change();
            $table->foreign('classe_id')->references('id')->on('classes')->onDelete('cascade');
        });
    }
};
