<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Matiere;
use Illuminate\Http\Request;

class MatiereController extends Controller
{
    public function index(Request $request)
    {
        $query = Matiere::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('nom', 'like', "%{$request->search}%")
                    ->orWhere('code', 'like', "%{$request->search}%");
            });
        }

        $matieres = $query->orderBy('nom')->get();

        return response()->json($matieres);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required',
            'code' => 'required|unique:matieres',
            'coefficient' => 'integer|min:1',
        ]);

        $matiere = Matiere::create($validated);

        return response()->json($matiere, 201);
    }

    public function show(Matiere $matiere)
    {
        return response()->json($matiere->load(['classes', 'professors']));
    }

    public function update(Request $request, Matiere $matiere)
    {
        $validated = $request->validate([
            'nom' => 'sometimes',
            'code' => 'sometimes|unique:matieres,code,' . $matiere->id,
            'coefficient' => 'integer|min:1',
        ]);

        $matiere->update($validated);

        return response()->json($matiere);
    }

    public function destroy(Matiere $matiere)
    {
        $matiere->delete();

        return response()->json(['message' => 'Matière supprimée']);
    }
}