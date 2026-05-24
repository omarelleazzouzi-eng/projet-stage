<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Club extends Model
{
    protected $fillable = ['nom', 'description', 'logo', 'responsable_id', 'est_active'];

    public function responsable()
    {
        return $this->belongsTo(User::class, 'responsable_id');
    }

    public function events()
    {
        return $this->hasMany(Event::class);
    }
}