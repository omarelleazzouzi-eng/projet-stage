<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Classe extends Model
{
    protected $fillable = ['nom', 'code', 'filiere_id', 'niveau_id', 'annee_scolaire', 'est_active'];

    protected function casts(): array
    {
        return [
            'est_active' => 'boolean',
        ];
    }

    public function filiere(): BelongsTo
    {
        return $this->belongsTo(Filiere::class);
    }

    public function niveau(): BelongsTo
    {
        return $this->belongsTo(Niveau::class);
    }

    public function etudiants(): HasMany
    {
        return $this->hasMany(Etudiant::class);
    }

    public function matieres(): BelongsToMany
    {
        return $this->belongsToMany(Matiere::class, 'classe_professeur_matiere', 'classe_id', 'matiere_id')
            ->withPivot('professeur_id')
            ->withTimestamps();
    }

    public function professors(): BelongsToMany
    {
        return $this->belongsToMany(Professeur::class, 'classe_professeur_matiere')->withTimestamps();
    }

    public function seances(): HasMany
    {
        return $this->hasMany(Seance::class);
    }

}