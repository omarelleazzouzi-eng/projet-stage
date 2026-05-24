<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AssignProfessorMatiereSeeder extends Seeder
{
    public function run()
    {
        // Clear table
        DB::table('classe_professeur_matiere')->truncate();

        // Get professor
        $prof = DB::table('professeurs')->first();
        if (!$prof) {
            echo "No professor found\n";
            return;
        }

        // Get all matieres
        $matieres = DB::table('matieres')->limit(10)->pluck('id');

        // Assign professor with different matieres to different classes
        $assignments = [
            ['classe_id' => 1, 'professeur_id' => $prof->id, 'matiere_id' => 2],
            ['classe_id' => 1, 'professeur_id' => $prof->id, 'matiere_id' => 8],
            ['classe_id' => 2, 'professeur_id' => $prof->id, 'matiere_id' => 2],
            ['classe_id' => 2, 'professeur_id' => $prof->id, 'matiere_id' => 10],
            ['classe_id' => 3, 'professeur_id' => $prof->id, 'matiere_id' => 15],
            ['classe_id' => 4, 'professeur_id' => $prof->id, 'matiere_id' => 54],
        ];

        foreach ($assignments as $assignment) {
            DB::table('classe_professeur_matiere')->insert([
                'classe_id' => $assignment['classe_id'],
                'professeur_id' => $assignment['professeur_id'],
                'matiere_id' => $assignment['matiere_id'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        echo "Created " . count($assignments) . " professor-matiere-class assignments\n";
    }
}