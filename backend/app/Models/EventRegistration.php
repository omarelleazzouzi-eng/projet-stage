<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventRegistration extends Model
{
    protected $fillable = ['event_id', 'etudiant_id', 'statut'];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function etudiant()
    {
        return $this->belongsTo(Etudiant::class);
    }
}