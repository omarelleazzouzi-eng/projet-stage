<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FixProfesseurSeeder extends Seeder
{
    public function run()
    {
        // Clear existing professor data
        DB::table('professor_classe')->delete();
        DB::table('professor_matiere')->delete();
        DB::table('professeurs')->delete();

        // Get the professor user
        $user = DB::table('users')
            ->where('email', 'prof@gestion-absences.com')
            ->first();

        if (!$user) {
            echo "User not found\n";
            return;
        }

        // Create professor
        $profId = DB::table('professeurs')->insertGetId([
            'cin' => 'P001',
            'nom' => 'Mohammed',
            'prenom' => 'Alami',
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

        // Assign all matieres to professor
        $matieres = DB::table('matieres')->pluck('id');
        foreach ($matieres as $matiereId) {
            DB::table('professor_matiere')->insert([
                'professor_id' => $profId,
                'matiere_id' => $matiereId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Also assign matieres to classes
        foreach ($classes as $classeId) {
            $classe = DB::table('classes')->where('id', $classeId)->first();
            $filiereId = $classe->filiere_id;
            
            // Get matieres for this filiere
            $filiereMatieres = DB::table('matieres')
                ->where('filiere_id', $filiereId)
                ->orWhereNull('filiere_id')
                ->pluck('id')
                ->take(10);

            foreach ($filiereMatieres as $matiereId) {
                DB::table('classe_matiere')->insertOrIgnore([
                    'classe_id' => $classeId,
                    'matiere_id' => $matiereId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        echo "Professeur créé avec {$classes->count()} classes et {$matieres->count()} matières\n";
    }
}