<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('professor_matiere', function (Blueprint $table) {
            $table->id();
            $table->foreignId('professor_id')->constrained('professeurs')->onDelete('cascade');
            $table->foreignId('matiere_id')->constrained()->onDelete('cascade');
            $table->timestamps();
            $table->unique(['professor_id', 'matiere_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('professor_matiere');
    }
};