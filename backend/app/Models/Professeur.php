<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Professeur extends Model
{
    protected $fillable = ['cin', 'nom', 'prenom', 'email', 'telephone', 'photo', 'user_id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function matieres(): BelongsToMany
    {
        return $this->belongsToMany(Matiere::class, 'classe_professeur_matiere', 'professeur_id', 'matiere_id')
            ->withPivot('classe_id')
            ->withTimestamps();
    }

    public function classes(): BelongsToMany
    {
        return $this->belongsToMany(Classe::class, 'classe_professeur_matiere', 'professeur_id', 'classe_id')
            ->withPivot('matiere_id')
            ->withTimestamps();
    }

    // Get classes with their subjects for this professor
    public function classesWithMatieres()
    {
        return $this->belongsToMany(Classe::class, 'classe_professeur_matiere', 'professeur_id', 'classe_id')
            ->with(['matieres' => function($q) {
                $q->where('professeur_id', $this->id);
            }])
            ->withTimestamps();
    }

    // Get matieres for a specific class
    public function matieresForClass($classeId)
    {
        return \App\Models\Matiere::whereHas('classes', function($q) use ($classeId) {
            $q->where('classe_id', $classeId)->where('professeur_id', $this->id);
        })->get();
    }

    public function seances(): HasMany
    {
        return $this->hasMany(Seance::class);
    }

    public function cours(): HasMany
    {
        return $this->hasMany(Cours::class, 'professor_id');
    }
}