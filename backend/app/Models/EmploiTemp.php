<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmploiTemp extends Model
{
    protected $table = 'emploi_temps';

    protected $fillable = [
        'classe_id', 'matiere_id', 'professeur_id',
        'jour', 'heure_debut', 'heure_fin', 'salle'
    ];

    public function classe(): BelongsTo
    {
        return $this->belongsTo(Classe::class);
    }

    public function matiere(): BelongsTo
    {
        return $this->belongsTo(Matiere::class);
    }

    public function professeur(): BelongsTo
    {
        return $this->belongsTo(Professeur::class, 'professeur_id');
    }
}
