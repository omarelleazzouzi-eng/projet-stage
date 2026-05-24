<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Make classe_id nullable for students
        Schema::table('etudiants', function (Blueprint $table) {
            $table->foreignId('classe_id')->nullable()->change();
        });

        // Create module_classe pivot table (modules per class)
        Schema::create('module_classe', function (Blueprint $table) {
            $table->id();
            $table->foreignId('classe_id')->constrained()->onDelete('cascade');
            $table->foreignId('matiere_id')->constrained()->onDelete('cascade');
            $table->timestamps();
            $table->unique(['classe_id', 'matiere_id']);
        });

        // Create emploi_temps table
        Schema::create('emploi_temps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('classe_id')->constrained()->onDelete('cascade');
            $table->foreignId('matiere_id')->constrained()->onDelete('cascade');
            $table->foreignId('professeur_id')->constrained('professeurs')->onDelete('cascade');
            $table->string('jour'); // Monday, Tuesday, etc.
            $table->time('heure_debut');
            $table->time('heure_fin');
            $table->string('salle')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('emploi_temps');
        Schema::dropIfExists('module_classe');
    }
};