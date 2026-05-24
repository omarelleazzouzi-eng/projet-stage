<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\StatistiqueService;
use Illuminate\Http\Request;

class StatistiqueController extends Controller
{
    public function dashboard()
    {
        $statistiqueService = app(StatistiqueService::class);
        $stats = $statistiqueService->getDashboard();

        return response()->json($stats);
    }

    public function mensuelles(Request $request)
    {
        $annee = $request->get('annee', now()->year);

        $statistiqueService = app(StatistiqueService::class);
        $stats = $statistiqueService->getStatistiquesMensuelles($annee);

        return response()->json($stats);
    }

    public function parFiliere()
    {
        $statistiqueService = app(StatistiqueService::class);
        $stats = $statistiqueService->getStatistiquesParFiliere();

        return response()->json($stats);
    }

    public function parClasse(Request $request, int $classeId)
    {
        $statistiqueService = app(StatistiqueService::class);
        $stats = $statistiqueService->getStatistiquesParClasse($classeId);

        return response()->json($stats);
    }

    public function generales()
    {
        $statistiqueService = app(\App\Services\AbsenceService::class);
        $stats = $statistiqueService->getStatistiques();

        return response()->json($stats);
    }
    
    // Statistics for professor dashboard
    public function professorDashboard(Request $request)
    {
        $professeur = $request->user()->professeur;
        
        if (!$professeur) {
            return response()->json(['error' => 'Professeur non trouvé'], 404);
        }
        
        $classes = $professeur->classes()->withCount('etudiants')->get();
        
        $totalEtudiants = $classes->sum('etudiants_count');
        
        $seancesCount = \App\Models\Seance::where('professor_id', $professeur->id)->count();
        
        // Absences non justifiées des dernières 30 jours
        $absencesCount = \App\Models\Absence::whereHas('seance', function($q) use ($professeur) {
            $q->where('professor_id', $professeur->id);
        })
        ->where('statut', 'absent')
        ->where('est_justifiee', false)
        ->where('created_at', '>=', now()->subDays(30))
        ->count();
        
        // Séances à venir
        $seancesAvenir = \App\Models\Seance::where('professor_id', $professeur->id)
            ->where('date', '>=', now()->toDateString())
            ->orderBy('date')
            ->orderBy('heure_debut')
            ->limit(5)
            ->get();
        
        return response()->json([
            'total_classes' => $classes->count(),
            'total_etudiants' => $totalEtudiants,
            'seances_count' => $seancesCount,
            'absences_30_jours' => $absencesCount,
            'classes' => $classes,
            'seances_a_venir' => $seancesAvenir
        ]);
    }

    // Get students with more than 10 hours of absence
    public function etudiantsAvertissement(Request $request)
    {
        $seuil = $request->get('seuil', 10);
        $statistiqueService = app(StatistiqueService::class);
        $etudiants = $statistiqueService->getEtudiantsAvecAvertissement($seuil);

        return response()->json([
            'seuil_heures' => $seuil,
            'total' => $etudiants->count(),
            'etudiants' => $etudiants
        ]);
    }
}