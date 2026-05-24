<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AbsenceProfesseur extends Model
{
    protected $fillable = ['professeur_id', 'date', 'type', 'motif', 'duree', 'est_justifiee'];

    protected $casts = [
        'date' => 'date',
        'est_justifiee' => 'boolean',
    ];

    public function professeur(): BelongsTo
    {
        return $this->belongsTo(Professeur::class);
    }
}