<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Classe;
use Illuminate\Http\Request;

class ClasseController extends Controller
{
    public function index(Request $request)
    {
        $query = Classe::with(['filiere', 'niveau', 'etudiants', 'matieres', 'professors']);

        if ($request->filiere_id) {
            $query->where('filiere_id', $request->filiere_id);
        }

        if ($request->niveau_id) {
            $query->where('niveau_id', $request->niveau_id);
        }

        if ($request->has('active')) {
            $query->where('est_active', $request->boolean('active'));
        }

        $classes = $query->orderBy('nom')->get();

        // Attach assignments from pivot table
        $classes->each(function ($classe) {
            $assignments = \DB::table('classe_professeur_matiere')
                ->where('classe_id', $classe->id)
                ->join('professeurs', 'classe_professeur_matiere.professeur_id', '=', 'professeurs.id')
                ->join('matieres', 'classe_professeur_matiere.matiere_id', '=', 'matieres.id')
                ->select('professeurs.id as professeur_id', 'professeurs.nom as professeur_nom', 'professeurs.prenom as professeur_prenom', 'matieres.id as matiere_id', 'matieres.nom as matiere_nom')
                ->get();
            $classe->setAttribute('assignments', $assignments);
        });

        return response()->json($classes);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required',
            'code' => 'required|unique:classes',
            'filiere_id' => 'required|exists:filieres,id',
            'niveau_id' => 'required|exists:niveaux,id',
            'annee_scolaire' => 'required|integer',
        ]);

        $classe = Classe::create($validated);

        return response()->json($classe->load(['filiere', 'niveau']), 201);
    }

    public function show(Classe $classe)
    {
        return response()->json($classe->load(['filiere', 'niveau', 'etudiants', 'matieres', 'professors']));
    }

    public function update(Request $request, Classe $classe)
    {
        $validated = $request->validate([
            'nom' => 'sometimes',
            'code' => 'sometimes|unique:classes,code,' . $classe->id,
            'filiere_id' => 'sometimes|exists:filieres,id',
            'niveau_id' => 'sometimes|exists:niveaux,id',
            'annee_scolaire' => 'sometimes|integer',
            'est_active' => 'sometimes|boolean',
        ]);

        $classe->update($validated);

        return response()->json($classe->load(['filiere', 'niveau']));
    }

    public function destroy(Classe $classe)
    {
        if ($classe->etudiants()->count() > 0) {
            return response()->json(['error' => 'Impossible de supprimer une classe avec des étudiants'], 422);
        }

        $classe->delete();

        return response()->json(['message' => 'Classe supprimée']);
    }

    public function matieres(Request $request, Classe $classe)
    {
        if ($request->has('add_matiere_id')) {
            $classe->matieres()->syncWithoutDetaching([$request->add_matiere_id]);
        }

        if ($request->has('remove_matiere_id')) {
            $classe->matieres()->detach($request->remove_matiere_id);
        }

        return response()->json($classe->matieres);
    }

    public function assignerProfesseur(Request $request, Classe $classe)
    {
        $request->validate([
            'professor_id' => 'required|exists:professeurs,id',
        ]);

        $classe->professors()->syncWithoutDetaching([$request->professor_id]);

        return response()->json([
            'message' => 'Professeur assigné à la classe',
            'professeurs' => $classe->professors
        ]);
    }

    // Assign professor with specific matiere to class
    public function assignerProfesseurMatiere(Request $request)
    {
        $request->validate([
            'classe_id' => 'required|exists:classes,id',
            'professor_id' => 'required|exists:professeurs,id',
            'matiere_id' => 'required|exists:matieres,id',
        ]);

        // Insert or update in the pivot table
        \DB::table('classe_professeur_matiere')->updateOrInsert(
            [
                'classe_id' => $request->classe_id,
                'professeur_id' => $request->professor_id,
                'matiere_id' => $request->matiere_id,
            ],
            [
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        return response()->json([
            'message' => 'Professeur et matière assignés à la classe'
        ]);
    }

    public function details(Classe $classe)
    {
        $classe->load([
            'filiere',
            'niveau',
            'etudiants',
            'matieres',
            'professors',
            'seances' => function ($q) {
                $q->orderBy('date', 'desc')->limit(20);
            },
            'seances.absences',
        ]);

        // Calculer les statistiques d'absences
        $totalAbsences = 0;
        $absencesNonJustifiees = 0;
        foreach ($classe->seances as $seance) {
            foreach ($seance->absences as $absence) {
                if ($absence->statut === 'absent') {
                    $totalAbsences++;
                    if (!$absence->est_justifiee) {
                        $absencesNonJustifiees++;
                    }
                }
            }
        }

        return response()->json([
            'classe' => $classe,
            'statistiques' => [
                'total_etudiants' => $classe->etudiants->count(),
                'total_absences' => $totalAbsences,
                'absences_non_justifiees' => $absencesNonJustifiees,
            ]
        ]);
    }
}