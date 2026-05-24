<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cours;
use App\Models\Classe;
use App\Models\Matiere;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CoursController extends Controller
{
    // Public - list all available courses
    public function publicIndex()
    {
        $cours = Cours::with(['matiere', 'professeur', 'classe.filiere'])->get();
        return response()->json($cours);
    }

    // Upload a course (professor only)
    public function upload(Request $request)
    {
        $request->validate([
            'titre' => 'required',
            'description' => 'nullable',
            'classe_id' => 'required|exists:classes,id',
            'matiere_id' => 'required|exists:matieres,id',
            'fichier' => 'required|mimes:pdf,doc,docx,ppt,pptx,xlsx',
            'type' => 'nullable|in:cours,exercice,td,exam,autre',
        ]);

        $path = $request->file('fichier')->store('cours', 'public');

        $cours = Cours::create([
            'titre' => $request->titre,
            'description' => $request->description,
            'classe_id' => $request->classe_id,
            'matiere_id' => $request->matiere_id,
            'professor_id' => $request->user()->professeur->id ?? null,
            'fichier' => $path,
            'type' => $request->type ?? 'cours',
        ]);

        return response()->json([
            'message' => 'Cours uploadé avec succès',
            'cours' => $cours->load(['matiere', 'professeur', 'classe'])
        ], 201);
    }

    // Get courses for a student (by their class)
    public function coursClasse(Request $request)
    {
        $user = $request->user();
        $classeId = $user->etudiant->classe_id ?? null;
        
        if (!$classeId) {
            return response()->json([], 200);
        }

        $cours = Cours::where('classe_id', $classeId)
            ->with(['matiere', 'professeur'])
            ->get();
        
        return response()->json($cours);
    }

    // Get my courses (professor)
    public function mesCours(Request $request)
    {
        $professeur = $request->user()->professeur;
        
        if (!$professeur) {
            return response()->json(['error' => 'Professeur non trouvé'], 404);
        }

        $cours = $professeur->cours()->with(['matiere', 'classe.filiere'])->get();
        
        return response()->json($cours);
    }

    // Download a course (authenticated students)
    public function download(Request $request, $id)
    {
        $cours = Cours::findOrFail($id);
        
        // Only students in the class can download
        $user = $request->user();
        if ($user->role === 'etudiant' && $user->etudiant) {
            if ($user->etudiant->classe_id !== $cours->classe_id) {
                return response()->json(['error' => 'Accès refusé'], 403);
            }
        }

        return response()->json([
            'url' => Storage::url($cours->fichier),
            'filename' => $cours->titre . '.' . $cours->type
        ]);
    }

    // Delete a course (professor who uploaded it)
    public function delete(Request $request, $id)
    {
        $cours = Cours::findOrFail($id);
        
        $professeur = $request->user()->professeur;
        if (!$professeur || $cours->professor_id !== $professeur->id) {
            return response()->json(['error' => 'Accès refusé'], 403);
        }

        Storage::disk('public')->delete($cours->fichier);
        $cours->delete();

        return response()->json(['message' => 'Cours supprimé']);
    }
}