<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Professeur;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfessorController extends Controller
{
    public function index(Request $request)
    {
        $query = Professeur::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('nom', 'like', "%{$request->search}%")
                    ->orWhere('prenom', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        $professeurs = $query->with(['matieres', 'classes'])->get();

        return response()->json($professeurs);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'cin' => 'required|unique:professeurs',
            'nom' => 'required',
            'prenom' => 'required',
            'email' => 'required|email|unique:professeurs',
            'telephone' => 'nullable',
        ]);

        $professeur =Professeur::create($validated);

        $user = User::create([
            'name' => "{$validated['nom']} {$validated['prenom']}",
            'email' => $validated['email'],
            'password' => Hash::make('professor123'),
            'role' => 'professor',
        ]);

        $professeur->update(['user_id' => $user->id]);

        return response()->json($professeur->load(['matieres', 'classes']), 201);
    }

    public function show(Professeur $professeur)
    {
        return response()->json($professeur->load(['matieres', 'classes', 'seances']));
    }

    public function update(Request $request, Professeur $professeur)
    {
        $validated = $request->validate([
            'cin' => 'sometimes|unique:professeurs,cin,' . $professeur->id,
            'nom' => 'sometimes',
            'prenom' => 'sometimes',
            'email' => 'sometimes|email|unique:professeurs,email,' . $professeur->id,
            'telephone' => 'nullable',
        ]);

        $professeur->update($validated);

        return response()->json($professeur);
    }

    public function destroy(Professeur $professeur)
    {
        if ($professeur->user) {
            $professeur->user->delete();
        }

        $professeur->delete();

        return response()->json(['message' => 'Professeur supprimé']);
    }

    public function assignerMatiere(Request $request, Professeur $professeur)
    {
        $request->validate([
            'matiere_id' => 'required|exists:matieres,id',
        ]);

        $professeur->matieres()->syncWithoutDetaching([$request->matiere_id]);

        return response()->json($professeur->matieres);
    }

    public function assignerClasse(Request $request, Professeur $professeur)
    {
        $request->validate([
            'classe_id' => 'required|exists:classes,id',
        ]);

        $professeur->classes()->syncWithoutDetaching([$request->classe_id]);

        return response()->json($professeur->classes);
    }

    public function mesClasses(Request $request)
    {
        $professeur = $request->user()->professeur;

        if (!$professeur) {
            return response()->json(['error' => 'Professeur non trouvé'], 404);
        }

        // Get classes with their subjects for this professor using the relationship
        $classes = $professeur->classes()->with([
            'filiere',
            'niveau',
            'etudiants'
        ])->get()->unique('id')->values()->map(function ($classe) {
            return [
                'id' => $classe->id,
                'nom' => $classe->nom,
                'code' => $classe->code,
                'filiere' => $classe->filiere,
                'niveau' => $classe->niveau,
                'etudiants_count' => $classe->etudiants->count(),
            ];
        });

        return response()->json($classes);
    }

    public function mesMatieres(Request $request)
    {
        $professeur = $request->user()->professeur;

        if (!$professeur) {
            return response()->json(['error' => 'Professeur non trouvé'], 404);
        }

        return response()->json($professeur->matieres);
    }

    // Get subjects for a specific class for this professor
    public function matieresClasse(Request $request, $classeId)
    {
        $professeur = $request->user()->professeur;

        if (!$professeur) {
            return response()->json(['error' => 'Professeur non trouvé'], 404);
        }

        $matieres = \DB::table('classe_professeur_matiere')
            ->where('professeur_id', $professeur->id)
            ->where('classe_id', $classeId)
            ->join('matieres', 'classe_professeur_matiere.matiere_id', '=', 'matieres.id')
            ->select('matieres.id', 'matieres.nom', 'matieres.code')
            ->get();

        return response()->json($matieres);
    }
}