<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Classe;
use App\Models\Professeur;
use App\Models\Matiere;
use DB;

class AssignResources extends Command
{
    protected $signature = 'app:assign-resources';

    public function handle()
    {
        $prof = Professeur::first();
        
        if (!$prof) {
            $this->error('Aucun professeur trouvé!');
            return 1;
        }
        
        $this->info('Assignation des ressources pour le professeur: ' . $prof->nom . ' ' . $prof->prenom);
        
        // Get all classes
        $classes = Classe::all();
        
        // DWFS Classes
        $dwfs1 = Classe::where('code', 'DWFS-1A-' . date('Y'))->first();
        $dwfs2 = Classe::where('code', 'DWFS-2A-' . date('Y'))->first();
        
        // PME Classes  
        $pme1 = Classe::where('code', 'PME-1A-' . date('Y'))->first();
        $pme2 = Classe::where('code', 'PME-2A-' . date('Y'))->first();
        
        // Matieres pour DWFS 1ère année (IDs 1-11)
        $dwfs1Matieres = Matiere::whereIn('id', range(1, 11))->get();
        
        // Matieres pour DWFS 2ème année (IDs 19-37)
        $dwfs2Matieres = Matiere::whereIn('id', range(19, 37))->get();
        
        // Matieres pour PME 1ère année (IDs 38-47)
        $pme1Matieres = Matiere::whereIn('id', range(38, 47))->get();
        
        // Matieres pour PME 2ème année (IDs 48-57)
        $pme2Matieres = Matiere::whereIn('id', range(48, 57))->get();
        
        // Assign matieres to DWFS 1
        if ($dwfs1) {
            foreach ($dwfs1Matieres as $matiere) {
                DB::table('classe_matiere')->updateOrInsert([
                    'classe_id' => $dwfs1->id,
                    'matiere_id' => $matiere->id
                ]);
            }
            $this->info('Matières assignées à: ' . $dwfs1->nom . ' (' . $dwfs1Matieres->count() . ' matières)');
        }
        
        // Assign matieres to DWFS 2
        if ($dwfs2) {
            foreach ($dwfs2Matieres as $matiere) {
                DB::table('classe_matiere')->updateOrInsert([
                    'classe_id' => $dwfs2->id,
                    'matiere_id' => $matiere->id
                ]);
            }
            $this->info('Matières assignées à: ' . $dwfs2->nom . ' (' . $dwfs2Matieres->count() . ' matières)');
        }
        
        // Assign matieres to PME 1
        if ($pme1) {
            foreach ($pme1Matieres as $matiere) {
                DB::table('classe_matiere')->updateOrInsert([
                    'classe_id' => $pme1->id,
                    'matiere_id' => $matiere->id
                ]);
            }
            $this->info('Matières assignées à: ' . $pme1->nom . ' (' . $pme1Matieres->count() . ' matières)');
        }
        
        // Assign matieres to PME 2
        if ($pme2) {
            foreach ($pme2Matieres as $matiere) {
                DB::table('classe_matiere')->updateOrInsert([
                    'classe_id' => $pme2->id,
                    'matiere_id' => $matiere->id
                ]);
            }
            $this->info('Matières assignées à: ' . $pme2->nom . ' (' . $pme2Matieres->count() . ' matières)');
        }
        
        // Assign professor to all classes
        foreach ($classes as $classe) {
            // Assign professor to class (table professor_classe uses professor_id)
            DB::table('professor_classe')->updateOrInsert([
                'professor_id' => $prof->id,
                'classe_id' => $classe->id
            ]);
            
            // Assign first matiere to professor-class-matiere (for demo)
            $firstMatiere = $classe->matieres()->first();
            if ($firstMatiere) {
                DB::table('classe_professeur_matiere')->updateOrInsert([
                    'professeur_id' => $prof->id,
                    'classe_id' => $classe->id,
                    'matiere_id' => $firstMatiere->id
                ]);
            }
        }
        
        $this->info('Professeur assigné à toutes les classes!');
        
        return 0;
    }
}