<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Classe;
use App\Models\Filiere;
use App\Models\Niveau;
use App\Models\Professeur;
use App\Models\Matiere;

class CheckClasses extends Command
{
    protected $signature = 'app:check-classes';

    public function handle()
    {
        $this->info('=== Classes créées ===');
        $classes = Classe::with(['filiere', 'niveau'])->get();
        
        foreach ($classes as $c) {
            $this->line($c->id . ': ' . $c->nom . ' - ' . $c->filiere->code . ' - ' . $c->niveau->code);
        }
        
        $this->info('Total: ' . $classes->count() . ' classes');
        
        // Show filieres
        $this->info('=== Filières ===');
        $filieres = Filiere::all();
        foreach ($filieres as $f) {
            $this->line($f->id . ': ' . $f->nom . ' (' . $f->code . ')');
        }
        
        // Show niveaux
        $this->info('=== Niveaux ===');
        $niveaux = Niveau::all();
        foreach ($niveaux as $n) {
            $this->line($n->id . ': ' . $n->nom . ' (' . $n->code . ')');
        }
        
        // Show matieres by filiere
        $this->info('=== Matières par Filière ===');
        foreach ($filieres as $f) {
            $matieres = Matiere::where('filiere_id', $f->id)->get();
            $this->line($f->code . ': ' . $matieres->count() . ' matières');
            foreach ($matieres->take(5) as $m) {
                $this->line('  - ' . $m->nom . ' (' . $m->code . ')');
            }
            if ($matieres->count() > 5) {
                $this->line('  ... et ' . ($matieres->count() - 5) . ' de plus');
            }
        }
        
        return 0;
    }
}