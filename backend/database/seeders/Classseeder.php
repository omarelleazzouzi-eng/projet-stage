<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Filiere;
use App\Models\Niveau;
use App\Models\Classe;

class Classseeder extends Seeder
{
    public function run(): void
    {
        $filiereDWFS = Filiere::where('code', 'DWFS')->first();
        $filierePME = Filiere::where('code', 'PME')->first();
        $niveau1 = Niveau::where('code', '1A')->first();
        $niveau2 = Niveau::where('code', '2A')->first();
        
        $annee = date('Y');
        
        // Classe 1: 1ère Année DWFS
        Classe::firstOrCreate(
            ['code' => 'DWFS-1A-' . $annee],
            [
                'nom' => '1ère Année DWFS',
                'filiere_id' => $filiereDWFS->id,
                'niveau_id' => $niveau1->id,
                'annee_scolaire' => $annee,
                'est_active' => true
            ]
        );
        
        // Classe 2: 2ème Année DWFS
        Classe::firstOrCreate(
            ['code' => 'DWFS-2A-' . $annee],
            [
                'nom' => '2ème Année DWFS',
                'filiere_id' => $filiereDWFS->id,
                'niveau_id' => $niveau2->id,
                'annee_scolaire' => $annee,
                'est_active' => true
            ]
        );
        
        // Classe 3: 1ère Année PME
        Classe::firstOrCreate(
            ['code' => 'PME-1A-' . $annee],
            [
                'nom' => '1ère Année PME',
                'filiere_id' => $filierePME->id,
                'niveau_id' => $niveau1->id,
                'annee_scolaire' => $annee,
                'est_active' => true
            ]
        );
        
        // Classe 4: 2ème Année PME
        Classe::firstOrCreate(
            ['code' => 'PME-2A-' . $annee],
            [
                'nom' => '2ème Année PME',
                'filiere_id' => $filierePME->id,
                'niveau_id' => $niveau2->id,
                'annee_scolaire' => $annee,
                'est_active' => true
            ]
        );
        
        $this->command->info('4 Classes créées avec succès!');
    }
}