<?php

namespace App\Services;

use App\Models\Absence;
use App\Models\Etudiant;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Collection;

class ExportService
{
    public function exporterAbsencesPdf(array $filtres): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $absenceService = app(AbsenceService::class);
        $absences = $absenceService->getAbsencesFiltrees($filtres);

        $pdf = Pdf::loadView('pdf.absences', [
            'absences' => $absences,
            'filtres' => $filtres,
            'date_generation' => now()->format('d/m/Y H:i'),
        ]);

        $filename = 'rapport_absences_' . now()->format('Y-m-d_His') . '.pdf';

        return response()->streamDownload(function () use ($pdf) {
            echo $pdf->output();
        }, $filename);
    }

    public function exporterEngagementPdf(int $etudiantId): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $etudiant = Etudiant::with('classe.filiere')->findOrFail($etudiantId);

        $pdf = Pdf::loadView('pdf.engagement', [
            'etudiant' => $etudiant,
            'date' => now()->format('d/m/Y'),
        ]);

        $filename = 'engagement_' . $etudiant->cne . '.pdf';

        return response()->streamDownload(function () use ($pdf) {
            echo $pdf->output();
        }, $filename);
    }

    public function exporterAvertissementPdf(int $etudiantId): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $etudiant = Etudiant::with('classe.filiere', 'absences.seance.matiere')->findOrFail($etudiantId);

        $absences = $etudiant->absences()->where('statut', 'absent')->with('seance')->get();
        
        $totalAbsences = $absences->count();
        $nonJustifiees = $absences->where('est_justifiee', false)->count();
        
        $totalHeures = $absences->sum(function ($absence) {
            if ($absence->seance && $absence->seance->heure_debut && $absence->seance->heure_fin) {
                $debut = \Carbon\Carbon::parse($absence->seance->heure_debut);
                $fin = \Carbon\Carbon::parse($absence->seance->heure_fin);
                return $debut->diffInMinutes($fin) / 60;
            }
            return 2;
        });

        $pdf = Pdf::loadView('pdf.avertissement', [
            'etudiant' => $etudiant,
            'totalAbsences' => $totalAbsences,
            'nonJustifiees' => $nonJustifiees,
            'totalHeures' => round($totalHeures, 1),
            'date' => now()->format('d/m/Y'),
        ]);

        $filename = 'avertissement_' . $etudiant->cne . '_' . now()->format('Y-m-d') . '.pdf';

        return response()->streamDownload(function () use ($pdf) {
            echo $pdf->output();
        }, $filename);
    }

    public function exporterRapportMensuel(int $classeId, int $mois, int $annee): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $classe = \App\Models\Classe::with(['etudiants', 'filiere'])->findOrFail($classeId);

        $absences = Absence::whereHas('seance', function ($q) use ($classeId, $mois, $annee) {
            $q->where('classe_id', $classeId)
                ->whereMonth('date', $mois)
                ->whereYear('date', $annee);
        })->with(['etudiant', 'seance.matiere'])->get();

        $pdf = Pdf::loadView('pdf.rapport_mensuel', [
            'classe' => $classe,
            'absences' => $absences,
            'mois' => $mois,
            'annee' => $annee,
            'date_generation' => now()->format('d/m/Y'),
        ]);

        $filename = 'rapport_mensuel_' . $classe->code . '_' . $mois . '_' . $annee . '.pdf';

        return response()->streamDownload(function () use ($pdf) {
            echo $pdf->output();
        }, $filename);
    }

    public function exporterRapportClassePdf(int $classeId): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $classe = \App\Models\Classe::with(['etudiants', 'filiere', 'niveau'])->findOrFail($classeId);

        $etudiants = $classe->etudiants()->where('est_archive', false)->get()->map(function ($etudiant) {
            $absences = $etudiant->absences()->where('statut', 'absent')->with('seance.matiere')->get();
            $totalAbsences = $absences->count();
            $totalHeures = $absences->sum(function ($absence) {
                if ($absence->seance && $absence->seance->heure_debut && $absence->seance->heure_fin) {
                    $debut = \Carbon\Carbon::parse($absence->seance->heure_debut);
                    $fin = \Carbon\Carbon::parse($absence->seance->heure_fin);
                    return $debut->diffInMinutes($fin) / 60;
                }
                return 2;
            });
            return [
                'id' => $etudiant->id,
                'nom' => $etudiant->nom,
                'prenom' => $etudiant->prenom,
                'cne' => $etudiant->cne,
                'email' => $etudiant->email,
                'total_absences' => $totalAbsences,
                'total_heures' => round($totalHeures, 1),
                'absences' => $absences,
            ];
        })->sortByDesc('total_heures')->values();

        $pdf = Pdf::loadView('pdf.rapport_classe', [
            'classe' => $classe,
            'etudiants' => $etudiants,
            'date_generation' => now()->format('d/m/Y H:i'),
        ]);

        $filename = 'rapport_classe_' . $classe->code . '_' . now()->format('Y-m-d') . '.pdf';

        return response()->streamDownload(function () use ($pdf) {
            echo $pdf->output();
        }, $filename);
    }
}