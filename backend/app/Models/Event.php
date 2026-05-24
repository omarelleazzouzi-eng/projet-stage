<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $fillable = [
        'titre', 'description', 'date_evenement', 'lieu', 'image', 
        'categorie', 'max_participants', 'club_id', 'user_id', 'est_active'
    ];

    protected $casts = [
        'date_evenement' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function club()
    {
        return $this->belongsTo(Club::class);
    }

    public function registrations()
    {
        return $this->hasMany(EventRegistration::class);
    }

    public function participants()
    {
        return $this->belongsToMany(Etudiant::class, 'event_registrations')
            ->withPivot('statut', 'created_at');
    }
}