<?php

namespace App\Services;

use App\Models\Absence;
use App\Models\Classe;
use App\Models\Etudiant;
use App\Models\Filiere;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class StatistiqueService
{
    public function getDashboard(): array
    {
        $totalEtudiants = Etudiant::where('est_archive', false)->count();
        $totalClasses = Classe::where('est_active', true)->count();

        // Total absences global
        $totalAbsences = Absence::where('statut', 'absent')->count();
        $totalRetards = Absence::where('statut', 'retard')->count();
        
        // Absences aujourd'hui
        $absencesAujourdhui = Absence::whereHas('seance', function ($q) {
            $q->where('date', Carbon::today());
        })->where('statut', 'absent')->count();

        // Absences ce mois
        $absencesMois = Absence::whereHas('seance', function ($q) {
            $q->whereMonth('date', Carbon::now()->month)
                ->whereYear('date', Carbon::now()->year);
        })->where('statut', 'absent')->count();

        // Absences non justifiées ce mois
        $absencesNonJustifiees = Absence::whereHas('seance', function ($q) {
            $q->whereMonth('date', Carbon::now()->month);
        })->where('statut', 'absent')
          ->where('est_justifiee', false)
          ->count();

        // Calculate total possible presences for the month (seances * students)
        $totalSeancesThisMonth = Seance::whereMonth('date', Carbon::now()->month)
            ->whereYear('date', Carbon::now()->year)
            ->count();
        
        $totalEtudiants = Etudiant::where('est_archive', false)->count();
        $totalPossiblePresences = $totalSeancesThisMonth * $totalEtudiants;
        
        $absentsCount = Absence::whereHas('seance', function ($q) {
            $q->whereMonth('date', Carbon::now()->month)
                ->whereYear('date', Carbon::now()->year);
        })->where('statut', 'absent')->count();
        
        $retardsCount = Absence::whereHas('seance', function ($q) {
            $q->whereMonth('date', Carbon::now()->month)
                ->whereYear('date', Carbon::now()->year);
        })->where('statut', 'retard')->count();
        
        $presentsCount = max(0, $totalPossiblePresences - $absentsCount - $retardsCount);
        
        $parStatut = [
            'presents' => $presentsCount,
            'absents' => $absentsCount,
            'retards' => $retardsCount,
        ];

        $classes = Classe::where('est_active', true)
            ->withCount('etudiants')
            ->get()
            ->map(function ($classe) {
                $classe->absences_count = Absence::whereHas('seance', function ($q) use ($classe) {
                    $q->where('classe_id', $classe->id)
                        ->whereMonth('date', Carbon::now()->month);
                })->count();
                return $classe;
            });

        // Top étudiants les plus absents
        $topAbsents = Etudiant::where('est_archive', false)
            ->with(['classe'])
            ->get()
            ->map(function ($etudiant) {
                $etudiant->total_absences = $etudiant->absences()->where('statut', 'absent')->count();
                $etudiant->total_retards = $etudiant->absences()->where('statut', 'retard')->count();
                return $etudiant;
            })
            ->sortByDesc('total_absences')
            ->take(10)
            ->values();

        return [
            'total_etudiants' => $totalEtudiants,
            'total_classes' => $totalClasses,
            'total_absences' => $totalAbsences,
            'total_retards' => $totalRetards,
            'absences_aujourdhui' => $absencesAujourdhui,
            'absences_mois' => $absencesMois,
            'absences_non_justifiees' => $absencesNonJustifiees,
            'par_statut' => $parStatut,
            'classes' => $classes,
            'top_absents' => $topAbsents,
        ];
    }

    public function getStatistiquesMensuelles(int $annee): array
    {
        $stats = [];

        for ($mois = 1; $mois <= 12; $mois++) {
            $debut = Carbon::create($annee, $mois, 1);
            $fin = $debut->copy()->endOfMonth();

            $absences = Absence::whereHas('seance', function ($q) use ($debut, $fin) {
                $q->whereBetween('date', [$debut, $fin]);
            })->get();

            $stats[] = [
                'mois' => $mois,
                'nom' => $debut->locale('fr_FR')->monthName,
                'total' => $absences->count(),
                'presents' => $absences->where('statut', 'present')->count(),
                'absents' => $absences->where('statut', 'absent')->count(),
                'retards' => $absences->where('statut', 'retard')->count(),
            ];
        }

        return $stats;
    }

    public function getStatistiquesParFiliere(): Collection
    {
        return Filiere::with(['classes.etudiants', 'classes.seances'])->get()->map(function ($filiere) {
            $totalEtudiants = $filiere->classes->sum(function ($classe) {
                return $classe->etudiants->count();
            });

            $totalAbsences = $filiere->classes->sum(function ($classe) {
                return $classe->seances->flatMap(function ($seance) {
                    return $seance->absences;
                })->count();
            });

            $tauxPresence = $totalEtudiants > 0
                ? round((1 - ($totalAbsences / ($totalEtudiants * 100))) * 100, 2)
                : 100;

            return [
                'id' => $filiere->id,
                'nom' => $filiere->nom,
                'code' => $filiere->code,
                'total_etudiants' => $totalEtudiants,
                'total_absences' => $totalAbsences,
                'taux_presence' => $tauxPresence,
            ];
        });
    }

    public function getStatistiquesParClasse(int $classeId): array
    {
        $classe = Classe::with(['etudiants', 'seances.absences', 'filiere', 'niveau'])->findOrFail($classeId);

        $absences = $classe->seances->flatMap(function ($seance) {
            return $seance->absences;
        });

        $parStatut = [
            'presents' => $absences->where('statut', 'present')->count(),
            'absents' => $absences->where('statut', 'absent')->count(),
            'retards' => $absences->where('statut', 'retard')->count(),
        ];

        $topAbsents = $classe->etudiants->map(function ($etudiant) use ($absences) {
            $count = $absences->where('etudiant_id', $etudiant->id)
                ->whereIn('statut', ['absent', 'retard'])
                ->count();
            return [
                'etudiant' => $etudiant,
                'total' => $count,
            ];
        })->sortByDesc('total')->take(10)->values();

        return [
            'classe' => $classe,
            'par_statut' => $parStatut,
            'top_absents' => $topAbsents,
        ];
    }

    public function getEtudiantsAvecAvertissement(int $seuilHeures = 10): Collection
    {
        $etudiants = Etudiant::where('est_archive', false)
            ->with(['classe.filiere', 'absences.seance'])
            ->get();

        return $etudiants->filter(function ($etudiant) {
            $totalHeures = $etudiant->absences->sum(function ($absence) {
                if ($absence->statut === 'absent' && $absence->seance && $absence->seance->heure_debut && $absence->seance->heure_fin) {
                    $debut = Carbon::parse($absence->seance->heure_debut);
                    $fin = Carbon::parse($absence->seance->heure_fin);
                    return $debut->diffInMinutes($fin) / 60;
                }
                return 0;
            });
            return $totalHeures >= 10;
        })->map(function ($etudiant) {
            $totalHeures = $etudiant->absences->sum(function ($absence) {
                if ($absence->statut === 'absent' && $absence->seance && $absence->seance->heure_debut && $absence->seance->heure_fin) {
                    $debut = Carbon::parse($absence->seance->heure_debut);
                    $fin = Carbon::parse($absence->seance->heure_fin);
                    return $debut->diffInMinutes($fin) / 60;
                }
                return 0;
            });
            return [
                'id' => $etudiant->id,
                'nom' => $etudiant->nom,
                'prenom' => $etudiant->prenom,
                'cne' => $etudiant->cne,
                'email' => $etudiant->email,
                'classe' => $etudiant->classe->nom ?? 'N/A',
                'filiere' => $etudiant->classe->filiere->nom ?? 'N/A',
                'total_heures' => round($totalHeures, 1),
                'total_absences' => $etudiant->absences->where('statut', 'absent')->count(),
            ];
        })->sortByDesc('total_heures')->values();
    }
}