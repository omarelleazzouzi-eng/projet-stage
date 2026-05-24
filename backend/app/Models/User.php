<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;  // ✅ Import Sanctum

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;  // ✅ Trait ajouté

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function etudiant()
    {
        return $this->hasOne(\App\Models\Etudiant::class);
    }

    public function professeur()
    {
        return $this->hasOne(\App\Models\Professeur::class);
    }
}