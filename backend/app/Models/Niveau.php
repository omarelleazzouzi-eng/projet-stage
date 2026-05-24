<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Niveau extends Model
{
    protected $fillable = ['nom', 'code', 'ordre'];

    public function classes(): HasMany
    {
        return $this->hasMany(Classe::class);
    }
}