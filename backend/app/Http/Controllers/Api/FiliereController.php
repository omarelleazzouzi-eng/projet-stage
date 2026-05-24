<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Filiere;
use Illuminate\Http\Request;

class FiliereController extends Controller
{
    public function index()
    {
        $filieres = Filiere::orderBy('nom')->get();
        return response()->json($filieres);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required',
            'code' => 'required|unique:filieres',
            'description' => 'nullable',
        ]);

        $filiere = Filiere::create($validated);
        return response()->json($filiere, 201);
    }

    public function show(Filiere $filiere)
    {
        return response()->json($filiere->load(['classes', 'classes.etudiants', 'classes.niveau']));
    }

    public function update(Request $request, Filiere $filiere)
    {
        $validated = $request->validate([
            'nom' => 'sometimes',
            'code' => 'sometimes|unique:filieres,code,' . $filiere->id,
            'description' => 'nullable',
        ]);

        $filiere->update($validated);
        return response()->json($filiere);
    }

    public function destroy(Filiere $filiere)
    {
        if ($filiere->classes()->count() > 0) {
            return response()->json(['error' => 'Impossible de supprimer une filière avec des classes'], 422);
        }

        $filiere->delete();
        return response()->json(['message' => 'Filière supprimée']);
    }
}