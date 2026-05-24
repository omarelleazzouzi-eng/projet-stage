<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Professeur;
use Illuminate\Http\Request;

class ProfesseurController extends Controller
{
    public function index(Request $request)
    {
        $query = Professeur::query();

        if ($request->search) {
            $query->where('nom', 'like', "%{$request->search}%")
                  ->orWhere('prenom', 'like', "%{$request->search}%");
        }

        $professeurs = $query->with('matieres')->get();
        return response()->json($professeurs);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'cin' => 'required|unique:professeurs',
            'nom' => 'required',
            'prenom' => 'required',
            'email' => 'required|email|unique:professeurs',
            'date_naissance' => 'required|date',
            'telephone' => 'nullable',
        ]);

        $professeur = Professeur::create($validated);
        return response()->json($professeur, 201);
    }

    public function show(Professeur $professeur)
    {
        return response()->json($professeur->load(['matieres', 'absences', 'absenceProfesseurs']));
    }

    public function update(Request $request, Professeur $professeur)
    {
        $validated = $request->validate([
            'cin' => 'sometimes|unique:professeurs,cin,' . $professeur->id,
            'nom' => 'sometimes',
            'prenom' => 'sometimes',
            'email' => 'sometimes|email|unique:professeurs,email,' . $professeur->id,
            'date_naissance' => 'sometimes|date',
            'telephone' => 'nullable',
        ]);

        $professeur->update($validated);
        return response()->json($professeur);
    }

    public function destroy(Professeur $professeur)
    {
        $professeur->delete();
        return response()->json(['message' => 'Professeur supprimé']);
    }
}