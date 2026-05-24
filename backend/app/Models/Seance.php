<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Seance extends Model
{
    protected $fillable = ['classe_id', 'matiere_id', 'professor_id', 'date', 'heure_debut', 'heure_fin'];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'heure_debut' => 'datetime:H:i',
            'heure_fin' => 'datetime:H:i',
        ];
    }

    public function classe(): BelongsTo
    {
        return $this->belongsTo(Classe::class);
    }

    public function matiere(): BelongsTo
    {
        return $this->belongsTo(Matiere::class);
    }

    public function professor(): BelongsTo
    {
        return $this->belongsTo(Professeur::class);
    }

    public function absences(): HasMany
    {
        return $this->hasMany(Absence::class);
    }
}