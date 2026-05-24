<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Absence extends Model
{
    protected $fillable = ['etudiant_id', 'seance_id', 'statut', 'heure_arrivee', 'justification', 'est_justifiee'];

    protected function casts(): array
    {
        return [
            'heure_arrivee' => 'datetime:H:i',
            'est_justifiee' => 'boolean',
        ];
    }

    public function etudiant(): BelongsTo
    {
        return $this->belongsTo(Etudiant::class);
    }

    public function seance(): BelongsTo
    {
        return $this->belongsTo(Seance::class);
    }

    public function justifiee()
    {
        $this->est_justifiee = true;
        $this->save();
    }
}