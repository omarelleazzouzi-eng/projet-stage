<?php

namespace App\Services;

use App\Models\Etudiant;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class ImportService
{
    public function importerEtudiants(array $data, int $classeId): array
    {
        $imported = 0;
        $errors = [];
        $created = [];

        foreach ($data as $index => $row) {
            try {
                $cne = $row['cne'] ?? null;
                $nom = $row['nom'] ?? null;
                $prenom = $row['prenom'] ?? null;
                $email = $row['email'] ?? null;
                $date_naissance = $row['date_naissance'] ?? null;
                $lieu_naissance = $row['lieu_naissance'] ?? null;
                $telephone = $row['telephone'] ?? null;

                if (!$cne || !$nom || !$prenom) {
                    $errors[] = "Ligne {$index}: CNE, nom ou prénom manquant";
                    continue;
                }

                $existingEtudiant = Etudiant::where('cne', $cne)->first();

                if ($existingEtudiant) {
                    $existingEtudiant->update([
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
                    $user = null;
                    if ($email) {
                        $user = User::create([
                            'name' => "{$nom} {$prenom}",
                            'email' => $email,
                            'password' => bcrypt('password123'),
                            'role' => 'etudiant',
                        ]);
                    }

                    Etudiant::create([
                        'cne' => $cne,
                        'nom' => $nom,
                        'prenom' => $prenom,
                        'email' => $email,
                        'date_naissance' => $this->parseDate($date_naissance),
                        'lieu_naissance' => $lieu_naissance,
                        'telephone' => $telephone,
                        'classe_id' => $classeId,
                        'user_id' => $user?->id,
                    ]);
                    $created[] = "Créé: {$nom} {$prenom}";
                }

                $imported++;
            } catch (\Exception $e) {
                $errors[] = "Ligne {$index}: " . $e->getMessage();
            }
        }

        return [
            'imported' => $imported,
            'errors' => $errors,
            'created' => $created,
        ];
    }

    public function parseDate($date): ?string
    {
        if (!$date) return null;

        try {
            return \Carbon\Carbon::parse($date)->format('Y-m-d');
        } catch (\Exception $e) {
            return null;
        }
    }

    public function validerFichier(array $data): array
    {
        $errors = [];
        $warnings = [];

        if (empty($data)) {
            return ['valide' => false, 'errors' => ['Le fichier est vide']];
        }

        $header = array_shift($data);
        $requiredColumns = ['cne', 'nom', 'prenom'];

        foreach ($requiredColumns as $col) {
            if (!in_array($col, $header)) {
                $errors[] = "Colonne manquante: {$col}";
            }
        }

        foreach ($data as $index => $row) {
            $rowData = array_combine($header, $row);

            if (empty($rowData['cne'])) {
                $errors[] = "Ligne " . ($index + 2) . ": CNE manquant";
            }

            if (Etudiant::where('cne', $rowData['cne'] ?? '')->exists()) {
                $warnings[] = "Ligne " . ($index + 2) . ": CNE existant (sera mis à jour)";
            }
        }

        return [
            'valide' => empty($errors),
            'errors' => $errors,
            'warnings' => $warnings,
            'total_lignes' => count($data),
        ];
    }
}