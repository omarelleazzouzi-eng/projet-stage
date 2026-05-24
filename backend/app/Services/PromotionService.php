<?php

namespace App\Services;

use App\Models\Classe;
use App\Models\Etudiant;
use App\Models\Niveau;
use Illuminate\Support\Collection;

class PromotionService
{
    public function promouvoirEtudiants(int $classeSourceId, int $classeDestinationId): array
    {
        $classeSource = Classe::findOrFail($classeSourceId);
        $classeDestination = Classe::findOrFail($classeDestinationId);

        if ($classeSource->filiere_id !== $classeDestination->filiere_id) {
            throw new \Exception('Les classes doivent être de la même filière');
        }

        $etudiants = Etudiant::where('classe_id', $classeSourceId)
            ->where('est_archive', false)
            ->get();

        foreach ($etudiants as $etudiant) {
            $etudiant->update([
                'classe_id' => $classeDestinationId,
            ]);
        }

        return [
            'promoted' => $etudiants->count(),
            'from' => $classeSource->nom,
            'to' => $classeDestination->nom,
        ];
    }

    public function getClassesPromotionPossible(int $filiereId): array
    {
        $niveaux = Niveau::orderBy('ordre')->get();
        $classesParNiveau = [];

        foreach ($niveaux as $niveau) {
            $classes = Classe::where('filiere_id', $filiereId)
                ->where('niveau_id', $niveau->id)
                ->where('est_active', true)
                ->get();

            if ($classes->count() > 0) {
                $classesParNiveau[] = [
                    'niveau' => $niveau,
                    'classes' => $classes,
                ];
            }
        }

        return $classesParNiveau;
    }
}