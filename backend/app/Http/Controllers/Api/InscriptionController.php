<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Etudiant;
use App\Models\Classe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class InscriptionController extends Controller
{
    // Inscription étudiant (public) — simplified, no validation required
    public function register(Request $request)
    {
        $validated = $request->validate([
            'cne' => 'nullable|unique:etudiants',
            'nom' => 'required',
            'prenom' => 'required',
            'email' => 'required|email|unique:users|unique:etudiants',
            'password' => 'required|min:6',
            'date_naissance' => 'nullable|date',
            'lieu_naissance' => 'nullable',
            'telephone' => 'nullable',
        ]);

        $name = "{$validated['nom']} {$validated['prenom']}";

        $user = User::create([
            'name' => $name,
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'etudiant',
            'is_active' => true,
        ]);

        $etudiant = Etudiant::create([
            'cne' => $validated['cne'] ?? 'EXT-' . strtoupper(substr($validated['email'], 0, 8)) . random_int(100, 999),
            'nom' => $validated['nom'],
            'prenom' => $validated['prenom'],
            'email' => $validated['email'],
            'date_naissance' => $validated['date_naissance'] ?? now()->subYears(18)->format('Y-m-d'),
            'lieu_naissance' => $validated['lieu_naissance'] ?? null,
            'telephone' => $validated['telephone'] ?? null,
            'classe_id' => null,
            'user_id' => $user->id,
        ]);

        return response()->json([
            'message' => 'Inscription réussie! Vous pouvez maintenant vous connecter.',
            'etudiant' => $etudiant
        ], 201);
    }

    // Validate student account (director only)
    public function valider(Request $request, User $user)
    {
        $user->update(['is_active' => true]);
        return response()->json(['message' => 'Compte validé avec succès']);
    }

    // Reject student account (director only)
    public function rejeter(Request $request, User $user)
    {
        $user->update(['is_active' => false]);
        return response()->json(['message' => 'Compte rejeté']);
    }
}