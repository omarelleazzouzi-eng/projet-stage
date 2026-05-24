<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Niveau;
use Illuminate\Http\Request;

class NiveauController extends Controller
{
    public function index()
    {
        $niveaux = Niveau::orderBy('ordre')->get();
        return response()->json($niveaux);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required',
            'code' => 'required|unique:niveaux',
            'ordre' => 'integer',
        ]);

        $niveau = Niveau::create($validated);
        return response()->json($niveau, 201);
    }

    public function show(Niveau $niveau)
    {
        return response()->json($niveau->load('classes'));
    }

    public function update(Request $request, Niveau $niveau)
    {
        $validated = $request->validate([
            'nom' => 'sometimes',
            'code' => 'sometimes|unique:niveaux,code,' . $niveau->id,
            'ordre' => 'integer',
        ]);

        $niveau->update($validated);
        return response()->json($niveau);
    }

    public function destroy(Niveau $niveau)
    {
        $niveau->delete();
        return response()->json(['message' => 'Niveau supprimé']);
    }
}