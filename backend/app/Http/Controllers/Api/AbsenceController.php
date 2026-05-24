<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Absence;
use App\Services\AbsenceService;
use Illuminate\Http\Request;

class AbsenceController extends Controller
{
    public function index(Request $request)
    {
        $filtres = $request->only([
            'date_debut', 'date_fin', 'classe_id', 'matiere_id',
            'etudiant_id', 'statut'
        ]);

        $absenceService = app(AbsenceService::class);
        $absences = $absenceService->getAbsencesFiltrees($filtres);

        return response()->json($absences);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'etudiant_id' => 'required|exists:etudiants,id',
            'seance_id' => 'required|exists:seances,id',
            'statut' => 'required|in:present,absent,retard',
            'justification' => 'nullable',
        ]);

        $absence = Absence::updateOrCreate(
            ['etudiant_id' => $validated['etudiant_id'], 'seance_id' => $validated['seance_id']],
            $validated
        );

        return response()->json($absence->load(['etudiant', 'seance.matiere']), 201);
    }

    public function show(Absence $absence)
    {
        return response()->json($absence->load(['etudiant.classe', 'seance.matiere', 'seance.professor']));
    }

    public function update(Request $request, Absence $absence)
    {
        $validated = $request->validate([
            'statut' => 'sometimes|in:present,absent,retard',
            'justification' => 'nullable',
            'est_justifiee' => 'boolean',
            'heure_arrivee' => 'nullable',
        ]);

        $absence->update($validated);

        return response()->json($absence->load(['etudiant', 'seance.matiere']));
    }

    public function destroy(Absence $absence)
    {
        $absence->delete();

        return response()->json(['message' => 'Absence supprimée']);
    }

    public function historique(Request $request, int $etudiantId)
    {
        $absenceService = app(AbsenceService::class);
        $historique = $absenceService->getHistoriqueEtudiant($etudiantId);

        return response()->json($historique);
    }

    public function justifier(Request $request, Absence $absence)
    {
        $absence->update([
            'est_justifiee' => true,
            'justification' => $request->justification,
        ]);

        return response()->json($absence);
    }

    // Get absences for current professor's classes or student's absences
    public function mesAbsences(Request $request)
    {
        $user = $request->user();
        
        // Student - get their own absences
        if ($user->role === 'etudiant') {
            $etudiant = $user->etudiant;
            if (!$etudiant) {
                return response()->json(['error' => 'Étudiant non trouvé'], 404);
            }
            $absences = \App\Models\Absence::where('etudiant_id', $etudiant->id)
                ->with(['seance.matiere', 'seance.professor'])
                ->orderByDesc('created_at')
                ->get();
            return response()->json($absences);
        }

        // Professor - get absences from their classes
        $professeur = $user->professeur;
        
        if (!$professeur) {
            return response()->json(['error' => 'Professeur non trouvé'], 404);
        }

        $filtres = $request->only([
            'date_debut', 'date_fin', 'classe_id', 'matiere_id',
            'etudiant_id', 'statut'
        ]);

        $absenceService = app(AbsenceService::class);
        $absences = $absenceService->getAbsencesFiltrees($filtres)
            ->filter(function ($absence) use ($professeur) {
                return $absence->seance && $absence->seance->professor_id === $professeur->id;
            })
            ->values();

        return response()->json($absences);
    }
}