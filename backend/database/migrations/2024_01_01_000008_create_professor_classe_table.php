<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('professor_classe', function (Blueprint $table) {
            $table->id();
            $table->foreignId('professor_id')->constrained('professeurs')->onDelete('cascade');
            $table->foreignId('classe_id')->constrained()->onDelete('cascade');
            $table->timestamps();
            $table->unique(['professor_id', 'classe_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('professor_classe');
    }
};