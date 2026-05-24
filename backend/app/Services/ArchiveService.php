<?php

namespace App\Services;

use App\Models\Classe;
use App\Models\Etudiant;
use Illuminate\Support\Collection;

class ArchiveService
{
    public function archiverEtudiants(int $classeId): array
    {
        $classe = Classe::findOrFail($classeId);
        $anneeScolaire = $classe->annee_scolaire;

        $etudiants = Etudiant::where('classe_id', $classeId)->get();

        foreach ($etudiants as $etudiant) {
            $etudiant->update([
                'est_archive' => true,
                'annee_archive' => $anneeScolaire,
            ]);
        }

        return [
            'archived' => $etudiants->count(),
            'classe' => $classe->nom,
            'annee' => $anneeScolaire,
        ];
    }

    public function restaurerEtudiant(int $etudiantId): Etudiant
    {
        $etudiant = Etudiant::findOrFail($etudiantId);
        $etudiant->update([
            'est_archive' => false,
            'annee_archive' => null,
        ]);

        return $etudiant;
    }

    public function getEtudiantsArchives(): Collection
    {
        return Etudiant::where('est_archive', true)
            ->with('classe')
            ->orderByDesc('annee_archive')
            ->get();
    }
}