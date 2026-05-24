<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Filiere;
use App\Models\Niveau;

class FiliereSeeder extends Seeder
{
    public function run(): void
    {
        $filieres = [
            ['nom' => 'BTS Développement Web et Full Stack', 'code' => 'BTS-DWFS', 'description' => 'BTS DWFS'],
            ['nom' => 'BTS Professions Immobilières', 'code' => 'BTS-PME', 'description' => 'BTS PME'],
            ['nom' => 'Terminale Collège', 'code' => 'TC', 'description' => 'Terminale Collège'],
            ['nom' => '1ère Baccalauréat', 'code' => '1BAC', 'description' => 'Première année Baccalauréat'],
            ['nom' => '2ème Baccalauréat', 'code' => '2BAC', 'description' => 'Deuxième année Baccalauréat'],
        ];

        foreach ($filieres as $filiere) {
            Filiere::create($filiere);
        }

        $niveaux = [
            ['nom' => 'TC', 'code' => 'TC', 'ordre' => 1],
            ['nom' => '1BAC', 'code' => '1BAC', 'ordre' => 2],
            ['nom' => '2BAC', 'code' => '2BAC', 'ordre' => 3],
            ['nom' => 'BTS 1', 'code' => 'BTS1', 'ordre' => 4],
            ['nom' => 'BTS 2', 'code' => 'BTS2', 'ordre' => 5],
        ];

        foreach ($niveaux as $niveau) {
            Niveau::create($niveau);
        }
    }
}