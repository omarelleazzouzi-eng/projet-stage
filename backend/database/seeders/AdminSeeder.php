<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::create([
            'name' => 'Administrateur',
            'email' => 'admin@gestion-absences.com',
            'password' => bcrypt('admin123'),
        ]);

        $admin->assignRole('admin');
    }
}