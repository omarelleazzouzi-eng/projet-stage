<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmploiTemp;
use Illuminate\Http\Request;

class EmploiDuTempsController extends Controller
{
    public function index(Request $request)
    {
        $query = EmploiTemp::with(['classe.filiere', 'matiere', 'professeur']);
        
        if ($request->classe_id) {
            $query->where('classe_id', $request->classe_id);
        }
        
        if ($request->professeur_id) {
            $query->where('professeur_id', $request->professeur_id);
        }
        
        $emploi = $query->orderBy('jour')->orderBy('heure_debut')->get();
        
        return response()->json($emploi);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'classe_id' => 'required|exists:classes,id',
            'matiere_id' => 'required|exists:matieres,id',
            'professeur_id' => 'required|exists:professeurs,id',
            'jour' => 'required|in:lundi,mardi,mercredi,jeudi,vendredi,samedi',
            'heure_debut' => 'required',
            'heure_fin' => 'required',
            'salle' => 'nullable',
        ]);

        // Vérifier les conflits
        $conflits = EmploiTemp::where('jour', $validated['jour'])
            ->where(function($q) use ($validated) {
                // Conflit professeur: même prof à la même heure
                $q->where('professeur_id', $validated['professeur_id'])
                  ->where(function($q2) use ($validated) {
                      $q2->whereBetween('heure_debut', [$validated['heure_debut'], $validated['heure_fin']])
                         ->orWhereBetween('heure_fin', [$validated['heure_debut'], $validated['heure_fin']])
                         ->orWhere(function($q3) use ($validated) {
                             $q3->where('heure_debut', '<=', $validated['heure_debut'])
                                ->where('heure_fin', '>=', $validated['heure_fin']);
                         });
                  });
            })
            ->exists();

        if ($conflits) {
            return response()->json([
                'error' => 'Conflit horaire: ce professeur a déjà un cours à cette heure'
            ], 422);
        }

        // Conflit salle
        if ($validated['salle']) {
            $conflitSalle = EmploiTemp::where('jour', $validated['jour'])
                ->where('salle', $validated['salle'])
                ->where(function($q) use ($validated) {
                    $q->whereBetween('heure_debut', [$validated['heure_debut'], $validated['heure_fin']])
                      ->orWhereBetween('heure_fin', [$validated['heure_debut'], $validated['heure_fin']]);
                })
                ->exists();

            if ($conflitSalle) {
                return response()->json([
                    'error' => 'Conflit de salle: cette salle est déjà occupée à cette heure'
                ], 422);
            }
        }

        // Conflit classe
        $conflitClasse = EmploiTemp::where('jour', $validated['jour'])
            ->where('classe_id', $validated['classe_id'])
            ->where(function($q) use ($validated) {
                $q->whereBetween('heure_debut', [$validated['heure_debut'], $validated['heure_fin']])
                  ->orWhereBetween('heure_fin', [$validated['heure_debut'], $validated['heure_fin']]);
            })
            ->exists();

        if ($conflitClasse) {
            return response()->json([
                'error' => 'Conflit: cette classe a déjà un cours à cette heure'
            ], 422);
        }

        $emploi = EmploiTemp::create($validated);

        return response()->json([
            'message' => 'Créneau ajouté avec succès',
            'emploi' => $emploi->load(['classe', 'matiere', 'professeur'])
        ], 201);
    }

    public function destroy(EmploiTemp $emploiTemp)
    {
        $emploiTemp->delete();
        return response()->json(['message' => 'Créneau supprimé']);
    }

    // Get schedule for a specific class (for students)
    public function parClasse($classeId)
    {
        $emploi = EmploiTemp::where('classe_id', $classeId)
            ->with(['matiere', 'professeur'])
            ->orderBy('jour')
            ->orderBy('heure_debut')
            ->get();
        
        return response()->json($emploi);
    }

    // Get schedule for a specific professor
    public function parProfesseur(Request $request)
    {
        $professeur = $request->user()->professeur;
        
        if (!$professeur) {
            return response()->json(['error' => 'Professeur non trouvé'], 404);
        }

        $emploi = EmploiTemp::where('professeur_id', $professeur->id)
            ->with(['classe', 'matiere'])
            ->orderBy('jour')
            ->orderBy('heure_debut')
            ->get();
        
        return response()->json($emploi);
    }
}