<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ExportService;
use Illuminate\Http\Request;

class RapportController extends Controller
{
    public function genererRapport(Request $request)
    {
        $filtres = $request->only([
            'date_debut', 'date_fin', 'classe_id', 'matiere_id', 'etudiant_id'
        ]);

        $exportService = app(ExportService::class);

        return $exportService->exporterAbsencesPdf($filtres);
    }

    public function genererEngagement(int $etudiantId)
    {
        $exportService = app(ExportService::class);

        return $exportService->exporterEngagementPdf($etudiantId);
    }

    public function genererAvertissement(int $etudiantId)
    {
        $exportService = app(ExportService::class);

        return $exportService->exporterAvertissementPdf($etudiantId);
    }

    public function rapportMensuel(Request $request, int $classeId)
    {
        $request->validate([
            'mois' => 'required|integer|min:1|max:12',
            'annee' => 'required|integer|min:2020|max:2030',
        ]);

        $exportService = app(ExportService::class);

        return $exportService->exporterRapportMensuel(
            $classeId,
            $request->mois,
            $request->annee
        );
    }

    public function rapportClasse(int $classeId)
    {
        $exportService = app(ExportService::class);

        return $exportService->exporterRapportClassePdf($classeId);
    }
}