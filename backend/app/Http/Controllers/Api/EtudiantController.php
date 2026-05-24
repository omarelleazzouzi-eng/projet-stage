<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Etudiant;
use App\Services\ArchiveService;
use App\Services\ImportService;
use App\Services\PromotionService;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class EtudiantController extends Controller
{
    public function index(Request $request)
    {
        $query = Etudiant::with(['classe.filiere', 'classe.niveau']);

        if ($request->has('archive') && $request->archive === 'true') {
            $query->where('est_archive', true);
        } else {
            $query->where('est_archive', false);
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('nom', 'like', "%{$request->search}%")
                    ->orWhere('prenom', 'like', "%{$request->search}%")
                    ->orWhere('cne', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        if ($request->classe_id) {
            $query->where('classe_id', $request->classe_id);
        }

        if ($request->filiere_id) {
            $query->whereHas('classe', function ($q) use ($request) {
                $q->where('filiere_id', $request->filiere_id);
            });
        }

        $etudiants = $query->orderBy('nom')->paginate(20);

        return response()->json($etudiants);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'cne' => 'required|unique:etudiants',
            'nom' => 'required',
            'prenom' => 'required',
            'email' => 'nullable|email|unique:etudiants',
            'date_naissance' => 'required|date',
            'lieu_naissance' => 'nullable',
            'telephone' => 'nullable',
            'classe_id' => 'required|exists:classes,id',
        ]);

        $etudiant = Etudiant::create($validated);

        return response()->json($etudiant->load('classe'), 201);
    }

    public function show(Etudiant $etudiant)
    {
        return response()->json($etudiant->load(['classe.filiere', 'classe.niveau', 'absences.seance.matiere']));
    }

    public function update(Request $request, Etudiant $etudiant)
    {
        $validated = $request->validate([
            'cne' => 'sometimes|unique:etudiants,cne,' . $etudiant->id,
            'nom' => 'sometimes',
            'prenom' => 'sometimes',
            'email' => 'sometimes|email|unique:etudiants,email,' . $etudiant->id,
            'date_naissance' => 'sometimes|date',
            'lieu_naissance' => 'nullable',
            'telephone' => 'nullable',
            'classe_id' => 'sometimes|exists:classes,id',
        ]);

        $etudiant->update($validated);

        return response()->json($etudiant->load('classe'));
    }

    public function destroy(Etudiant $etudiant)
    {
        $etudiant->delete();
        return response()->json(['message' => 'Étudiant supprimé']);
    }

    public function search(Request $request)
    {
        $query = $request->get('q', '');

        $etudiants = Etudiant::where('est_archive', false)
            ->where(function ($q) use ($query) {
                $q->where('nom', 'like', "%{$query}%")
                    ->orWhere('prenom', 'like', "%{$query}%")
                    ->orWhere('cne', 'like', "%{$query}%");
            })
            ->with('classe')
            ->limit(20)
            ->get();

        return response()->json($etudiants);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv',
            'classe_id' => 'required|exists:classes,id',
        ]);

        $classeId = $request->classe_id;
        $classe = \App\Models\Classe::find($classeId);

        $file = $request->file('file');
        $data = Excel::toArray([], $file);
        $rows = array_shift($data);
        $header = array_shift($rows);

        $data = array_map(function ($row) use ($header) {
            return array_combine($header, $row);
        }, $rows);

        $imported = 0;
        $errors = [];
        $created = [];
        $duplicates = 0;

        foreach ($data as $index => $row) {
            try {
                // Skip empty rows
                if (empty($row['cne']) && empty($row['nom'])) {
                    continue;
                }

                $cne = $row['cne'] ?? null;
                $nom = $row['nom'] ?? null;
                $prenom = $row['prenom'] ?? null;
                $email = $row['email'] ?? null;
                $date_naissance = $row['date_naissance'] ?? null;
                $lieu_naissance = $row['lieu_naissance'] ?? null;
                $telephone = $row['telephone'] ?? null;
                $classe_nom = $row['classe'] ?? $row['classe_nom'] ?? null;
                $filiere_code = $row['filiere'] ?? $row['filiere_code'] ?? null;
                $niveau_code = $row['niveau'] ?? $row['niveau_code'] ?? null;

                if (!$cne || !$nom || !$prenom) {
                    $errors[] = "Ligne " . ($index + 2) . ": CNE, nom ou prénom manquant";
                    continue;
                }

                // Find or create class
                $classe = null;
                if ($classe_nom && $filiere_code && $niveau_code) {
                    $filiere = \App\Models\Filiere::where('code', $filiere_code)->first();
                    $niveau = \App\Models\Niveau::where('code', $niveau_code)->first();
                    
                    if ($filiere && $niveau) {
                        $annee = date('Y');
                        $classe_code = strtoupper($filiere_code . '-' . $niveau_code . '-' . $annee);
                        
                        $classe = \App\Models\Classe::firstOrCreate(
                            ['code' => $classe_code],
                            [
                                'nom' => $classe_nom,
                                'filiere_id' => $filiere->id,
                                'niveau_id' => $niveau->id,
                                'annee_scolaire' => $annee,
                                'est_active' => true
                            ]
                        );
                    }
                }

                // Use provided classe_id or find existing
                $classeId = $request->classe_id;
                if (!$classeId && $classe) {
                    $classeId = $classe->id;
                }

                if (!$classeId) {
                    $errors[] = "Ligne " . ($index + 2) . ": Classe non spécifiée";
                    continue;
                }

                // Check if student exists
                $etudiant = \App\Models\Etudiant::where('cne', $cne)->first();

                if ($etudiant) {
                    $etudiant->update([
                        'nom' => $nom,
                        'prenom' => $prenom,
                        'email' => $email,
                        'date_naissance' => $this->parseDate($date_naissance),
                        'lieu_naissance' => $lieu_naissance,
                        'telephone' => $telephone,
                        'classe_id' => $classeId,
                    ]);
                    $created[] = "Mise à jour: {$nom} {$prenom}";
                } else {
                    \App\Models\Etudiant::create([
                        'cne' => $cne,
                        'nom' => $nom,
                        'prenom' => $prenom,
                        'email' => $email,
                        'date_naissance' => $this->parseDate($date_naissance),
                        'lieu_naissance' => $lieu_naissance,
                        'telephone' => $telephone,
                        'classe_id' => $classeId,
                    ]);
                    $created[] = "Créé: {$nom} {$prenom}";
                }

                $imported++;
            } catch (\Exception $e) {
                $errors[] = "Ligne " . ($index + 2) . ": " . $e->getMessage();
            }
        }

        return response()->json([
            'imported' => $imported,
            'errors' => $errors,
            'created' => $created,
        ]);
    }

    private function parseDate($date): ?string
    {
        if (!$date) return null;
        try {
            return \Carbon\Carbon::parse($date)->format('Y-m-d');
        } catch (\Exception $e) {
            return null;
        }
    }

    public function archiver(Request $request, Etudiant $etudiant)
    {
        $archiveService = app(ArchiveService::class);
        $result = $archiveService->restaurerEtudiant($etudiant->id);

        return response()->json($result);
    }

    public function promouvoir(Request $request)
    {
        $request->validate([
            'classe_source_id' => 'required|exists:classes,id',
            'classe_destination_id' => 'required|exists:classes,id',
        ]);

        $promotionService = app(PromotionService::class);
        $result = $promotionService->promouvoirEtudiants(
            $request->classe_source_id,
            $request->classe_destination_id
        );

        return response()->json($result);
    }

    public function monProfil(Request $request)
    {
        $user = $request->user();
        $etudiant = Etudiant::with(['classe.filiere', 'classe.niveau', 'absences.seance.matiere'])
            ->where('user_id', $user->id)
            ->first();

        if (!$etudiant) {
            return response()->json(['error' => 'Étudiant non trouvé'], 404);
        }

        $totalAbsences = $etudiant->absences()->where('statut', 'absent')->count();
        $absencesNonJustifiees = $etudiant->absences()->where('statut', 'absent')->where('est_justifiee', false)->count();
        $totalRetards = $etudiant->absences()->where('statut', 'retard')->count();

        return response()->json([
            'etudiant' => $etudiant,
            'statistiques' => [
                'total_absences' => $totalAbsences,
                'absences_non_justifiees' => $absencesNonJustifiees,
                'total_retards' => $totalRetards,
            ]
        ]);
    }

    public function inscriptionsEnAttente()
    {
        $users = \App\Models\User::where('role', 'etudiant')
            ->where('is_active', false)
            ->with('etudiant')
            ->get();

        return response()->json($users);
    }

    // Get students by class (for professor)
    public function parClasse(Request $request, $classeId)
    {
        $etudiants = \App\Models\Etudiant::where('classe_id', $classeId)
            ->where('est_archive', false)
            ->get()
            ->map(function ($etudiant) {
                return [
                    'id' => $etudiant->id,
                    'nom' => $etudiant->nom,
                    'prenom' => $etudiant->prenom,
                    'cne' => $etudiant->cne,
                    'email' => $etudiant->email,
                    'classe_id' => $etudiant->classe_id,
                ];
            });

        return response()->json($etudiants);
    }
}