<?php

namespace App\Services;

use App\Models\Absence;
use App\Models\Etudiant;
use App\Models\Seance;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class AbsenceService
{
    public function getAbsencesFiltrees(array $filtres): Collection
    {
        $query = Absence::with(['etudiant.classe', 'seance.matiere', 'seance.professor']);

        if (!empty($filtres['date_debut']) && !empty($filtres['date_fin'])) {
            $query->whereHas('seance', function ($q) use ($filtres) {
                $q->whereBetween('date', [$filtres['date_debut'], $filtres['date_fin']]);
            });
        }

        if (!empty($filtres['classe_id'])) {
            $query->whereHas('etudiant', function ($q) use ($filtres) {
                $q->where('classe_id', $filtres['classe_id']);
            });
        }

        if (!empty($filtres['matiere_id'])) {
            $query->whereHas('seance', function ($q) use ($filtres) {
                $q->where('matiere_id', $filtres['matiere_id']);
            });
        }

        if (!empty($filtres['etudiant_id'])) {
            $query->where('etudiant_id', $filtres['etudiant_id']);
        }

        if (!empty($filtres['statut'])) {
            $query->where('statut', $filtres['statut']);
        }

        return $query->orderByDesc('seance_id')->get();
    }

    public function getStatistiques(): array
    {
        $aujourdhui = Carbon::today();
        $debutMois = Carbon::now()->startOfMonth();
        $finMois = Carbon::now()->endOfMonth();

        $absencesAujourdhui = Absence::whereHas('seance', function ($q) use ($aujourdhui) {
            $q->where('date', $aujourdhui);
        })->where('statut', 'absent')->count();

        $absencesMois = Absence::whereHas('seance', function ($q) use ($debutMois, $finMois) {
            $q->whereBetween('date', [$debutMois, $finMois]);
        })->where('statut', 'absent')->count();

        $retardsMois = Absence::whereHas('seance', function ($q) use ($debutMois, $finMois) {
            $q->whereBetween('date', [$debutMois, $finMois]);
        })->where('statut', 'retard')->count();

        $totalEtudiants = Etudiant::where('est_archive', false)->count();

        $etudiantsPlusAbsents = Etudiant::where('est_archive', false)
            ->withCount(['absences' => function ($q) {
                $q->where('statut', 'absent');
            }])
            ->having('absences_count', '>', 0)
            ->orderByDesc('absences_count')
            ->limit(10)
            ->get();

        return [
            'absences_aujourdhui' => $absencesAujourdhui,
            'absences_mois' => $absencesMois,
            'retards_mois' => $retardsMois,
            'total_etudiants' => $totalEtudiants,
            'etudiants_plus_absents' => $etudiantsPlusAbsents,
        ];
    }

    public function getHistoriqueEtudiant(int $etudiantId): array
    {
        $etudiant = Etudiant::with('classe.filiere')->findOrFail($etudiantId);

        $absences = Absence::where('etudiant_id', $etudiantId)
            ->with('seance.matiere')
            ->orderByDesc('seance_id')
            ->get();

        $totalAbsences = $absences->where('statut', 'absent')->count();
        $totalRetards = $absences->where('statut', 'retard')->count();
        $totalHeures = $totalAbsences + $totalRetards;

        $nonJustifiees = $absences->where('statut', 'absent')->where('est_justifiee', false)->count();

        return [
            'etudiant' => $etudiant,
            'absences' => $absences,
            'total_absences' => $totalAbsences,
            'total_retards' => $totalRetards,
            'total_heures' => $totalHeures,
            'non_justifiees' => $nonJustifiees,
        ];
    }

    public function genererEmargement(int $seanceId): array
    {
        $seance = Seance::with(['classe.etudiants', 'matiere', 'professor'])->findOrFail($seanceId);

        $etudiants = $seance->classe->etudiants->map(function ($etudiant) use ($seance) {
            $absence = Absence::where('etudiant_id', $etudiant->id)
                ->where('seance_id', $seance->id)
                ->first();

            return [
                'etudiant' => $etudiant,
                'statut' => $absence?->statut ?? 'present',
                'absence_id' => $absence?->id,
            ];
        });

        return [
            'seance' => $seance,
            'etudiants' => $etudiants,
        ];
    }

    public function emarger(int $seanceId, int $etudiantId, string $statut): Absence
    {
        $absence = Absence::updateOrCreate(
            ['seance_id' => $seanceId, 'etudiant_id' => $etudiantId],
            ['statut' => $statut]
        );

        return $absence;
    }
}