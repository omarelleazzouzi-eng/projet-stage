<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class MvpDataSeeder extends Seeder
{
    public function run()
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        try { DB::table('absences')->truncate(); } catch (\Exception $e) {}
        try { DB::table('seances')->truncate(); } catch (\Exception $e) {}
        try { DB::table('classe_professeur_matiere')->truncate(); } catch (\Exception $e) {}
        try { DB::table('cours')->truncate(); } catch (\Exception $e) {}
        try { DB::table('events')->truncate(); } catch (\Exception $e) {}
        try { DB::table('event_registrations')->truncate(); } catch (\Exception $e) {}
        try { DB::table('emploi_du_temps')->truncate(); } catch (\Exception $e) {}
        try { DB::table('etudiants')->truncate(); } catch (\Exception $e) {}
        try { DB::table('professeurs')->truncate(); } catch (\Exception $e) {}
        try { DB::table('classes')->truncate(); } catch (\Exception $e) {}
        try { DB::table('matieres')->truncate(); } catch (\Exception $e) {}
        try { DB::table('niveaux')->truncate(); } catch (\Exception $e) {}
        try { DB::table('filieres')->truncate(); } catch (\Exception $e) {}
        try { DB::table('users')->truncate(); } catch (\Exception $e) {}

        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        // 1. Create Filieres
        $filiereIds = [];
        $filieres = [
            ['nom' => 'Développement Web et Systèmes', 'code' => 'DWFS'],
            ['nom' => 'PME et Gestion', 'code' => 'PME'],
        ];
        foreach ($filieres as $f) {
            $filiereIds[$f['code']] = DB::table('filieres')->insertGetId([
                'nom' => $f['nom'],
                'code' => $f['code'],
                'description' => 'Filière ' . $f['nom'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 2. Create Niveaux
        $niveau1Id = DB::table('niveaux')->insertGetId([
            'nom' => '1ère année', 'code' => '1A', 'ordre' => 1,
            'created_at' => now(), 'updated_at' => now(),
        ]);
        $niveau2Id = DB::table('niveaux')->insertGetId([
            'nom' => '2ème année', 'code' => '2A', 'ordre' => 2,
            'created_at' => now(), 'updated_at' => now(),
        ]);

        // 3. Create Matieres
        $matieresData = [
            ['nom' => 'Développement Web', 'code' => 'DEVWEB'],
            ['nom' => 'Base de données', 'code' => 'BDD'],
            ['nom' => 'Anglais', 'code' => 'ANG'],
            ['nom' => 'Français', 'code' => 'FR'],
            ['nom' => 'Mathématiques', 'code' => 'MATH'],
            ['nom' => 'Comptabilité', 'code' => 'COMPTA'],
            ['nom' => 'Gestion', 'code' => 'GEST'],
            ['nom' => 'Marketing', 'code' => 'MKT'],
        ];
        $matiereIds = [];
        foreach ($matieresData as $m) {
            $matiereIds[$m['code']] = DB::table('matieres')->insertGetId([
                'nom' => $m['nom'],
                'code' => $m['code'],
                'coefficient' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 4. Create Classes
        $classData = [
            ['nom' => '1ère année DWFS', 'code' => 'DWFS-1A', 'filiere_code' => 'DWFS', 'niveau_id' => $niveau1Id],
            ['nom' => '2ème année DWFS', 'code' => 'DWFS-2A', 'filiere_code' => 'DWFS', 'niveau_id' => $niveau2Id],
            ['nom' => '1ère année PME', 'code' => 'PME-1A', 'filiere_code' => 'PME', 'niveau_id' => $niveau1Id],
            ['nom' => '2ème année PME', 'code' => 'PME-2A', 'filiere_code' => 'PME', 'niveau_id' => $niveau2Id],
        ];
        $classIds = [];
        foreach ($classData as $c) {
            $classIds[$c['code']] = DB::table('classes')->insertGetId([
                'nom' => $c['nom'],
                'code' => $c['code'],
                'filiere_id' => $filiereIds[$c['filiere_code']],
                'niveau_id' => $c['niveau_id'],
                'annee_scolaire' => date('Y'),
                'est_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 5. Create Director
        $directorUserId = DB::table('users')->insertGetId([
            'name' => 'Directeur Administrateur',
            'email' => 'directeur@gestion-absences.com',
            'password' => Hash::make('directeur123'),
            'role' => 'directeur',
            'is_active' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 6. Create Professor
        $profUserId = DB::table('users')->insertGetId([
            'name' => 'Mohammed Alami',
            'email' => 'prof@gestion-absences.com',
            'password' => Hash::make('prof123'),
            'role' => 'professor',
            'is_active' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $professorId = DB::table('professeurs')->insertGetId([
            'cin' => 'P001',
            'nom' => 'Alami',
            'prenom' => 'Mohammed',
            'email' => 'prof@gestion-absences.com',
            'telephone' => '0600000000',
            'user_id' => $profUserId,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 7. Link professor to classes with matieres via pivot table
        $profClassMatieres = [
            'DWFS-1A' => ['DEVWEB', 'BDD', 'ANG'],
            'DWFS-2A' => ['DEVWEB', 'BDD', 'MATH'],
            'PME-1A' => ['COMPTA', 'GEST', 'FR'],
            'PME-2A' => ['COMPTA', 'GEST', 'MKT'],
        ];

        foreach ($profClassMatieres as $classCode => $matiereCodes) {
            foreach ($matiereCodes as $matiereCode) {
                DB::table('classe_professeur_matiere')->insert([
                    'classe_id' => $classIds[$classCode],
                    'professeur_id' => $professorId,
                    'matiere_id' => $matiereIds[$matiereCode],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // 8. Create Students
        $studentsByClass = [
            'DWFS-1A' => [
                ['cne' => 'E1001', 'nom' => 'Alaoui', 'prenom' => 'Ahmed', 'email' => 'ahmed@email.com'],
                ['cne' => 'E1002', 'nom' => 'Benali', 'prenom' => 'Fatima', 'email' => 'fatima@email.com'],
                ['cne' => 'E1003', 'nom' => 'Khaldi', 'prenom' => 'Youssef', 'email' => 'youssef@email.com'],
                ['cne' => 'E1004', 'nom' => 'Moumen', 'prenom' => 'Aicha', 'email' => 'aicha@email.com'],
                ['cne' => 'E1005', 'nom' => 'Sabbagh', 'prenom' => 'Omar', 'email' => 'omar@email.com'],
            ],
            'DWFS-2A' => [
                ['cne' => 'E2001', 'nom' => 'El Amrani', 'prenom' => 'Imane', 'email' => 'imane@email.com'],
                ['cne' => 'E2002', 'nom' => 'Bennani', 'prenom' => 'Sara', 'email' => 'sara@email.com'],
                ['cne' => 'E2003', 'nom' => 'Idrissi', 'prenom' => 'Hassan', 'email' => 'hassan@email.com'],
                ['cne' => 'E2004', 'nom' => 'Ouazzani', 'prenom' => 'Nadia', 'email' => 'nadia@email.com'],
                ['cne' => 'E2005', 'nom' => 'Tazi', 'prenom' => 'Khalid', 'email' => 'khalid@email.com'],
            ],
            'PME-1A' => [
                ['cne' => 'E3001', 'nom' => 'Berrada', 'prenom' => 'Hicham', 'email' => 'hicham@email.com'],
                ['cne' => 'E3002', 'nom' => 'Chraibi', 'prenom' => 'Samira', 'email' => 'samira@email.com'],
                ['cne' => 'E3003', 'nom' => 'Daoudi', 'prenom' => 'Karim', 'email' => 'karim@email.com'],
                ['cne' => 'E3004', 'nom' => 'El Fassi', 'prenom' => 'Leila', 'email' => 'leila@email.com'],
                ['cne' => 'E3005', 'nom' => 'Gharbi', 'prenom' => 'Mounir', 'email' => 'mounir@email.com'],
            ],
            'PME-2A' => [
                ['cne' => 'E4001', 'nom' => 'Hamzaoui', 'prenom' => 'Rachid', 'email' => 'rachid@email.com'],
                ['cne' => 'E4002', 'nom' => 'Jaidi', 'prenom' => 'Nawal', 'email' => 'nawal@email.com'],
                ['cne' => 'E4003', 'nom' => 'Kabbaj', 'prenom' => 'Soufiane', 'email' => 'soufiane@email.com'],
                ['cne' => 'E4004', 'nom' => 'Loukili', 'prenom' => 'Houda', 'email' => 'houda@email.com'],
                ['cne' => 'E4005', 'nom' => 'Marhraoui', 'prenom' => 'Adil', 'email' => 'adil@email.com'],
            ],
        ];

        foreach ($studentsByClass as $classCode => $students) {
            foreach ($students as $s) {
                $studentUserId = DB::table('users')->insertGetId([
                    'name' => $s['prenom'] . ' ' . $s['nom'],
                    'email' => $s['email'],
                    'password' => Hash::make('student123'),
                    'role' => 'etudiant',
                    'is_active' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                DB::table('etudiants')->insert([
                    'cne' => $s['cne'],
                    'nom' => $s['nom'],
                    'prenom' => $s['prenom'],
                    'email' => $s['email'],
                    'date_naissance' => '2000-01-01',
                    'telephone' => '0600000000',
                    'classe_id' => $classIds[$classCode],
                    'user_id' => $studentUserId,
                    'est_archive' => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        echo "\n✅ MVP Data seeded successfully!\n";
        echo "- 1 Director (directeur@gestion-absences.com / directeur123)\n";
        echo "- 1 Professor (prof@gestion-absences.com / prof123) with 4 classes & 12 matiere assignments\n";
        echo "- 8 Matieres\n";
        echo "- 2 Filieres (DWFS, PME)\n";
        echo "- 2 Niveaux (1ère année, 2ème année)\n";
        echo "- 4 Classes (DWFS-1A, DWFS-2A, PME-1A, PME-2A)\n";
        echo "- 20 Students (5 per class, passwords: student123)\n";
    }
}
