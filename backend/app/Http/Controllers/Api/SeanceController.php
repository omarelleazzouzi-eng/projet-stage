<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Seance;
use App\Services\AbsenceService;
use Illuminate\Http\Request;

class SeanceController extends Controller
{
    public function index(Request $request)
    {
        $query = Seance::with(['classe', 'matiere', 'professor']);

        if ($request->professor_id) {
            $query->where('professor_id', $request->professor_id);
        }

        if ($request->classe_id) {
            $query->where('classe_id', $request->classe_id);
        }

        if ($request->date) {
            $query->where('date', $request->date);
        }

        $seances = $query->orderByDesc('date')->orderBy('heure_debut')->paginate(30);

        return response()->json($seances);
    }
    
    // Get seances for current professor
    public function mesSeances(Request $request)
    {
        $professeur = $request->user()->professeur;
        
        if (!$professeur) {
            return response()->json(['error' => 'Professeur non trouvé'], 404);
        }
        
        $query = Seance::with(['classe', 'matiere', 'professor'])
            ->where('professor_id', $professeur->id);
        
        if ($request->classe_id) {
            $query->where('classe_id', $request->classe_id);
        }
        
        if ($request->date) {
            $query->where('date', $request->date);
        }
        
        $seances = $query->orderByDesc('date')->orderBy('heure_debut')->paginate(50);
        
        return response()->json($seances);
    }
    
    // Get seances for a specific class
    public function seancesParClasse(Request $request, $classeId)
    {
        $professeur = $request->user()->professeur;
        
        if (!$professeur) {
            return response()->json(['error' => 'Professeur non trouvé'], 404);
        }
        
        $seances = Seance::with(['classe', 'matiere', 'professor'])
            ->where('professor_id', $professeur->id)
            ->where('classe_id', $classeId)
            ->orderByDesc('date')
            ->orderBy('heure_debut')
            ->get();
        
        return response()->json($seances);
    }

    public function store(Request $request)
    {
        $professeur = $request->user()->professeur;
        
        if (!$professeur) {
            return response()->json(['error' => 'Professeur non trouvé'], 422);
        }

        $validated = $request->validate([
            'classe_id' => 'required|exists:classes,id',
            'matiere_id' => 'required|exists:matieres,id',
            'date' => 'required|date',
            'heure_debut' => 'required',
            'heure_fin' => 'required',
        ]);

        $validated['professor_id'] = $professeur->id;

        $seance = Seance::create($validated);

        return response()->json($seance->load(['classe', 'matiere', 'professor']), 201);
    }
    
    // Auto-create or get existing séance for today
    public function autoCreateSeance(Request $request)
    {
        $professeur = $request->user()->professeur;
        
        if (!$professeur) {
            return response()->json(['error' => 'Professeur non trouvé'], 422);
        }

        $validated = $request->validate([
            'classe_id' => 'required|exists:classes,id',
            'matiere_id' => 'required|exists:matieres,id',
            'date' => 'required|date',
            'heure_debut' => 'required',
            'heure_fin' => 'required',
        ]);

        // Check if seance already exists for this class/matiere/date/professor
        $existingSeance = Seance::where('classe_id', $validated['classe_id'])
            ->where('matiere_id', $validated['matiere_id'])
            ->where('professor_id', $professeur->id)
            ->where('date', $validated['date'])
            ->where('heure_debut', $validated['heure_debut'])
            ->first();

        if ($existingSeance) {
            return response()->json($existingSeance->load(['classe', 'matiere', 'professor', 'absences']));
        }

        // Create new seance
        $validated['professor_id'] = $professeur->id;
        $seance = Seance::create($validated);

        return response()->json($seance->load(['classe', 'matiere', 'professor']), 201);
    }

public function show(Seance $seance)
    {
        $seance->load(['classe.etudiants.user', 'matiere', 'professor', 'absences.etudiant']);
        
        return response()->json($seance);
    }

    // Marquer les présences/absences pour une séance
    public function marquerAbsences(Request $request, Seance $seance)
    {
        $validated = $request->validate([
            'absences' => 'required|array',
            'absences.*.etudiant_id' => 'required|exists:etudiants,id',
            'absences.*.statut' => 'required|in:present,absent,retard',
        ]);

        $absenceService = app(AbsenceService::class);
        $results = [];

        foreach ($validated['absences'] as $absenceData) {
            // Vérifier que l'étudiant est dans la classe de la séance
            $etudiant = \App\Models\Etudiant::find($absenceData['etudiant_id']);
            if (!$etudiant || $etudiant->classe_id !== $seance->classe_id) {
                continue;
            }

            if ($absenceData['statut'] === 'present') {
                // Supprimer l'absence si elle existe
                \App\Models\Absence::where('seance_id', $seance->id)
                    ->where('etudiant_id', $absenceData['etudiant_id'])
                    ->delete();
                $results[] = ['etudiant_id' => $absenceData['etudiant_id'], 'statut' => 'present'];
            } else {
                // Créer ou mettre à jour l'absence
                $absence = \App\Models\Absence::firstOrCreate(
                    [
                        'seance_id' => $seance->id,
                        'etudiant_id' => $absenceData['etudiant_id']
                    ],
                    [
                        'statut' => $absenceData['statut'],
                        'est_justifiee' => false
                    ]
                );
                $absence->update(['statut' => $absenceData['statut']]);
                $results[] = ['etudiant_id' => $absenceData['etudiant_id'], 'statut' => $absenceData['statut']];
            }
        }

        return response()->json([
            'message' => 'Absences enregistrées',
            'results' => $results
        ]);
    }

    public function update(Request $request, Seance $seance)
    {
        $validated = $request->validate([
            'classe_id' => 'sometimes|exists:classes,id',
            'matiere_id' => 'sometimes|exists:matieres,id',
            'professor_id' => 'sometimes|exists:professeurs,id',
            'date' => 'sometimes|date',
            'heure_debut' => 'sometimes',
            'heure_fin' => 'sometimes',
        ]);

        $seance->update($validated);

        return response()->json($seance->load(['classe', 'matiere', 'professor']));
    }

    public function destroy(Seance $seance)
    {
        if ($seance->absences()->count() > 0) {
            return response()->json(['error' => 'Impossible de supprimer une séance avec des absences'], 422);
        }

        $seance->delete();

        return response()->json(['message' => 'Séance supprimée']);
    }

    public function emarger(Request $request, Seance $seance)
    {
        $request->validate([
            'etudiant_id' => 'required|exists:etudiants,id',
            'statut' => 'required|in:present,absent,retard',
        ]);

        $absenceService = app(AbsenceService::class);
        $absence = $absenceService->emarger($seance->id, $request->etudiant_id, $request->statut);

        return response()->json($absence);
    }
}