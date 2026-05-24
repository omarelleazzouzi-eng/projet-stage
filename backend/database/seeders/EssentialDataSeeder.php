<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EssentialDataSeeder extends Seeder
{
    public function run()
    {
        // Clear and recreate essential data
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        
        DB::table('classes')->truncate();
        DB::table('filieres')->truncate();
        DB::table('niveaux')->truncate();
        DB::table('professeurs')->truncate();
        DB::table('professor_classe')->truncate();
        
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        // Filières
        $dwfsId = DB::table('filieres')->insertGetId([
            'nom' => 'BTS Développement Web et Full Stack',
            'code' => 'DWFS',
            'description' => 'BTS DWFS',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $pmeId = DB::table('filieres')->insertGetId([
            'nom' => 'BTS Gestion des Petites et Moyennes Entreprises',
            'code' => 'PME',
            'description' => 'BTS PME',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Niveaux
        $niveau1Id = DB::table('niveaux')->insertGetId([
            'nom' => '1ère année',
            'code' => '1A',
            'ordre' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $niveau2Id = DB::table('niveaux')->insertGetId([
            'nom' => '2ème année',
            'code' => '2A',
            'ordre' => 2,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Classes
        DB::table('classes')->insert([
            [
                'nom' => '1ère année DWFS',
                'code' => 'DWFS-1A-2026',
                'filiere_id' => $dwfsId,
                'niveau_id' => $niveau1Id,
                'annee_scolaire' => 2026,
                'est_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nom' => '2ème année DWFS',
                'code' => 'DWFS-2A-2026',
                'filiere_id' => $dwfsId,
                'niveau_id' => $niveau2Id,
                'annee_scolaire' => 2026,
                'est_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nom' => '1ère année PME',
                'code' => 'PME-1A-2026',
                'filiere_id' => $pmeId,
                'niveau_id' => $niveau1Id,
                'annee_scolaire' => 2026,
                'est_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nom' => '2ème année PME',
                'code' => 'PME-2A-2026',
                'filiere_id' => $pmeId,
                'niveau_id' => $niveau2Id,
                'annee_scolaire' => 2026,
                'est_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Get or create professor
        $user = DB::table('users')->where('email', 'prof@gestion-absences.com')->first();
        
        if ($user) {
            $profId = DB::table('professeurs')->insertGetId([
                'cin' => 'P001',
                'nom' => 'Alami',
                'prenom' => 'Mohammed',
                'email' => 'prof@gestion-absences.com',
                'telephone' => '0600000000',
                'user_id' => $user->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Assign all classes to professor
            $classes = DB::table('classes')->pluck('id');
            foreach ($classes as $classeId) {
                DB::table('professor_classe')->insert([
                    'professor_id' => $profId,
                    'classe_id' => $classeId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            echo "Professeur créé avec {$classes->count()} classes assignées\n";
        }

        echo "Données essentielles créées: 4 classes, 2 filières, 2 niveaux\n";
    }
}