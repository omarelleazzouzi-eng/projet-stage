<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('etudiants', function (Blueprint $table) {
            $table->id();
            $table->string('cne', 20)->unique();
            $table->string('nom');
            $table->string('prenom');
            $table->string('email', 150)->nullable();
            $table->date('date_naissance');
            $table->string('lieu_naissance')->nullable();
            $table->string('telephone', 20)->nullable();
            $table->string('photo')->nullable();
            $table->foreignId('classe_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->boolean('est_archive')->default(false);
            $table->integer('annee_archive')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('etudiants');
    }
};