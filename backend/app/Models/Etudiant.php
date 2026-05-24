<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Etudiant extends Model
{
    protected $fillable = [
        'cne', 'nom', 'prenom', 'email', 'date_naissance',
        'lieu_naissance', 'telephone', 'photo', 'classe_id',
        'user_id', 'est_archive', 'annee_archive'
    ];

    protected function casts(): array
    {
        return [
            'date_naissance' => 'date',
            'est_archive' => 'boolean',
        ];
    }

    public function classe(): BelongsTo
    {
        return $this->belongsTo(Classe::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function absences(): HasMany
    {
        return $this->hasMany(Absence::class);
    }

    public function getTotalAbsencesAttribute(): int
    {
        return $this->absences()->where('statut', 'absent')->count();
    }

    public function getTotalRetardsAttribute(): int
    {
        return $this->absences()->where('statut', 'retard')->count();
    }

    public function getTotalHeuresAttribute(): int
    {
        return $this->absences()->whereIn('statut', ['absent', 'retard'])->count();
    }
}