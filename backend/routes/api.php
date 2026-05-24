<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EtudiantController;
use App\Http\Controllers\Api\ProfessorController;
use App\Http\Controllers\Api\ClasseController;
use App\Http\Controllers\Api\MatiereController;
use App\Http\Controllers\Api\FiliereController;
use App\Http\Controllers\Api\NiveauController;
use App\Http\Controllers\Api\SeanceController;
use App\Http\Controllers\Api\AbsenceController;
use App\Http\Controllers\Api\StatistiqueController;
use App\Http\Controllers\Api\RapportController;
use App\Http\Controllers\Api\InscriptionController;
use App\Http\Controllers\Api\CoursController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\EmploiDuTempsController;

// ============================================
// PUBLIC ROUTES
// ============================================
Route::post('/login', [AuthController::class, 'login']);
Route::post('/inscription', [InscriptionController::class, 'register']);
Route::get('/public/cours', [CoursController::class, 'publicIndex']);
Route::get('/public/events', [EventController::class, 'publicIndex']);
Route::get('/filieres', [FiliereController::class, 'index']);

// ============================================
    // AUTHENTICATED ROUTES
    // ============================================
    Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Common data - accessible to all authenticated users
    Route::get('/classes', [ClasseController::class, 'index']);
    Route::get('/matieres', [MatiereController::class, 'index']);
    Route::get('/filieres', [FiliereController::class, 'index']);
    Route::get('/niveaux', [NiveauController::class, 'index']);
    Route::get('/professeurs', [ProfessorController::class, 'index']);

    // ============================================
    // DIRECTEUR - FULL ACCESS
    // ============================================
    Route::middleware(['role:directeur'])->group(function () {
        // Étudiants
        Route::apiResource('etudiants', EtudiantController::class);
        Route::post('/etudiants/import-excel', [EtudiantController::class, 'importExcel']);
        Route::post('/etudiants/import', [EtudiantController::class, 'import']);
        Route::get('/etudiants/search', [EtudiantController::class, 'search']);
        Route::post('/etudiants/{etudiant}/archiver', [EtudiantController::class, 'archiver']);
        Route::post('/etudiants/promouvoir', [EtudiantController::class, 'promouvoir']);
        Route::get('/etudiants/par-classe/{classeId}', [EtudiantController::class, 'parClasse']);
        
        // Validation inscriptions
        Route::post('/inscriptions/{user}/valider', [InscriptionController::class, 'valider']);
        Route::post('/inscriptions/{user}/rejeter', [InscriptionController::class, 'rejeter']);
        Route::get('/inscriptions/attentes', [EtudiantController::class, 'inscriptionsEnAttente']);

        // Professeurs
        Route::apiResource('professeurs', ProfessorController::class);
        Route::post('/professeurs/{professeur}/matiere', [ProfessorController::class, 'assignerMatiere']);
        Route::post('/professeurs/{professeur}/classe', [ProfessorController::class, 'assignerClasse']);

        // Classes
        Route::apiResource('classes', ClasseController::class);
        Route::post('/classes/{classe}/matieres', [ClasseController::class, 'matieres']);
        Route::post('/classes/{classe}/professeur', [ClasseController::class, 'assignerProfesseur']);
        Route::post('/classes/assign-professor-matiere', [ClasseController::class, 'assignerProfesseurMatiere']);
        Route::get('/classes/{classe}/detail', [ClasseController::class, 'details']);

        // Matières
        Route::apiResource('matieres', MatiereController::class);

        // Filières
        Route::apiResource('filieres', FiliereController::class);

        // Niveaux
        Route::apiResource('niveaux', NiveauController::class);

        // Séances (voir toutes)
        Route::get('/seances', [SeanceController::class, 'index']);

        // Absences (voir toutes)
        Route::get('/absences', [AbsenceController::class, 'index']);

        // Avertissements - Étudiants avec plus de 10h d'absence
        Route::get('/avertissements/etudiants-avertir', [StatistiqueController::class, 'etudiantsAvertissement']);
        
        // Rapports PDF
        Route::get('/rapports/absence', [RapportController::class, 'genererRapport']);
        Route::get('/rapports/engagement/{etudiantId}', [RapportController::class, 'genererEngagement']);
        Route::get('/rapports/avertissement/{etudiantId}', [RapportController::class, 'genererAvertissement']);
        Route::get('/rapports/mensuel/{classeId}', [RapportController::class, 'rapportMensuel']);
        Route::get('/rapports/classe/{classeId}', [RapportController::class, 'rapportClasse']);
    });

    // ============================================
    // PROFESSEUR - LIMITED ACCESS
    // ============================================
    Route::middleware(['role:professor'])->group(function () {
        // Mes classes
        Route::get('/professor/classes', [ProfessorController::class, 'mesClasses']);
        Route::get('/professor/matieres', [ProfessorController::class, 'mesMatieres']);
        Route::get('/professor/classes/{classeId}/matieres', [ProfessorController::class, 'matieresClasse']);
        Route::get('/professor/stats', [StatistiqueController::class, 'professorDashboard']);
        
        // Auto-create or get séance
        Route::post('/professor/seance/auto', [SeanceController::class, 'autoCreateSeance']);
        
        // Mes séances
        Route::get('/professor/seances', [SeanceController::class, 'mesSeances']);
        Route::get('/professor/seances/by-classe/{classeId}', [SeanceController::class, 'seancesParClasse']);
        
        // Étudiants d'une classe
        Route::get('/classes/{classe}/etudiants', [EtudiantController::class, 'parClasse']);

        // Séances
        Route::post('/seances', [SeanceController::class, 'store']);
        Route::put('/seances/{seance}', [SeanceController::class, 'update']);
        Route::delete('/seances/{seance}', [SeanceController::class, 'destroy']);

        // Émargement
        Route::get('/seances/{seance}', [SeanceController::class, 'show']);
        Route::post('/seances/{seance}/emarger', [SeanceController::class, 'emarger']);
        Route::post('/seances/{seance}/absences', [SeanceController::class, 'marquerAbsences']);

        // Absences (mes classes seulement)
        Route::get('/professor/absences', [AbsenceController::class, 'mesAbsences']);
        Route::put('/absences/{absence}', [AbsenceController::class, 'update']);
        Route::post('/absences/{absence}/justifier', [AbsenceController::class, 'justifier']);

        // Cours
        Route::post('/professor/cours', [CoursController::class, 'upload']);
        Route::get('/professor/cours', [CoursController::class, 'mesCours']);
        Route::delete('/professor/cours/{id}', [CoursController::class, 'delete']);
    });

    // ============================================
    // ÉTUDIANT - LIMITED ACCESS
    // ============================================
    Route::middleware(['role:etudiant'])->group(function () {
        // Mon profil
        Route::get('/etudiant/profil', [EtudiantController::class, 'monProfil']);
        Route::get('/etudiant/mes-cours', [CoursController::class, 'coursClasse']);
        Route::get('/etudiant/mes-absences', [AbsenceController::class, 'mesAbsences']);
        Route::get('/cours/{id}/download', [CoursController::class, 'download']);
    });

    // ============================================
    // COMMON - ALL AUTHENTICATED USERS
    // ============================================

    // Statistiques
    Route::get('/statistiques/dashboard', [StatistiqueController::class, 'dashboard']);
    Route::get('/statistiques/mensuelles', [StatistiqueController::class, 'mensuelles']);
    Route::get('/statistiques/filieres', [StatistiqueController::class, 'parFiliere']);
    Route::get('/statistiques/classe/{classeId}', [StatistiqueController::class, 'parClasse']);
    Route::get('/statistiques/generales', [StatistiqueController::class, 'generales']);

    // Historique étudiant
    Route::get('/absences/historique/{etudiantId}', [AbsenceController::class, 'historique']);

    // Événements
    Route::get('/events/mes-inscriptions', [EventController::class, 'myRegistrations']);
    Route::apiResource('events', EventController::class);
    Route::get('/events/{event}/participants', [EventController::class, 'show']);
    Route::post('/events/{event}/register', [EventController::class, 'register']);
    Route::delete('/events/{event}/unregister', [EventController::class, 'unregister']);

    // Inscriptions événements
    Route::put('/event-registrations/{registration}', [EventController::class, 'updateRegistration']);

    // Clubs
    Route::apiResource('clubs', EventController::class)->except(['index']);
    Route::get('/clubs', [EventController::class, 'indexClubs']);

    // Emploi du temps
    Route::get('/emploi-temp', [EmploiDuTempsController::class, 'index']);
    Route::post('/emploi-temp', [EmploiDuTempsController::class, 'store']);
    Route::delete('/emploi-temp/{emploiTemp}', [EmploiDuTempsController::class, 'destroy']);
    Route::get('/emploi-temp/classe/{classeId}', [EmploiDuTempsController::class, 'parClasse']);
    Route::get('/emploi-temp/professeur', [EmploiDuTempsController::class, 'parProfesseur']);
});