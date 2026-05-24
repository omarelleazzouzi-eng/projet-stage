<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Matiere extends Model
{
    protected $fillable = ['nom', 'code', 'coefficient'];

    public function classes(): BelongsToMany
    {
        return $this->belongsToMany(Classe::class)->withTimestamps();
    }

    public function professors(): BelongsToMany
    {
        return $this->belongsToMany(Professeur::class, 'professor_matiere')->withTimestamps();
    }

    public function seances(): HasMany
    {
        return $this->hasMany(Seance::class);
    }
}