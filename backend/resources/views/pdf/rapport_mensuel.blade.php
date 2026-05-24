<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Rapport Mensuel - {{ $classe->nom }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 30px; font-size: 12px; }
        .header { text-align: center; margin-bottom: 25px; }
        .header h1 { font-size: 20px; color: #2563eb; margin-bottom: 5px; }
        .header p { color: #666; }
        .info { background: #f3f4f6; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .info p { margin: 5px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #1f2937; color: white; font-size: 11px; }
        .badge { padding: 2px 8px; border-radius: 3px; font-size: 10px; }
        .badge-absent { background: #fee2e2; color: #dc2626; }
        .badge-retard { background: #fef3c7; color: #d97706; }
        .badge-present { background: #d1fae5; color: #059669; }
        .summary { display: flex; justify-content: space-around; margin-top: 20px; padding: 15px; background: #eff6ff; border-radius: 5px; }
        .summary-item { text-align: center; }
        .summary-value { font-size: 24px; font-weight: bold; color: #2563eb; }
        .summary-label { font-size: 11px; color: #666; }
        .footer { margin-top: 25px; text-align: right; font-size: 10px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Rapport Mensuel des Absences</h1>
        <p>Établissement BTS - Gestion des Absences</p>
    </div>

    <div class="info">
        <p><strong>Classe:</strong> {{ $classe->nom }}</p>
        <p><strong>Filière:</strong> {{ $classe->filiere->nom ?? 'N/A' }}</p>
        <p><strong>Période:</strong> {{\Carbon\Carbon::create(null, $mois)->locale('fr_FR')->monthName }} {{ $annee }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Étudiant</th>
                <th>Matière</th>
                <th>Professeur</th>
                <th>Statut</th>
                <th>Justifiée</th>
            </tr>
        </thead>
        <tbody>
            @forelse($absences as $absence)
            <tr>
                <td>{{ $absence->seance->date->format('d/m/Y') }}</td>
                <td>{{ $absence->etudiant->nom }} {{ $absence->etudiant->prenom }}</td>
                <td>{{ $absence->seance->matiere->nom }}</td>
                <td>{{ $absence->seance->professor->nom ?? 'N/A' }} {{ $absence->seance->professor->prenom ?? '' }}</td>
                <td>
                    <span class="badge badge-{{ $absence->statut }}">
                        {{ ucfirst($absence->statut) }}
                    </span>
                </td>
                <td>{{ $absence->est_justifiee ? '✓' : '✗' }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="6" style="text-align: center;">Aucune absence enregistrée</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="summary">
        <div class="summary-item">
            <div class="summary-value">{{ $absences->count() }}</div>
            <div class="summary-label">Total</div>
        </div>
        <div class="summary-item">
            <div class="summary-value">{{ $absences->where('statut', 'absent')->count() }}</div>
            <div class="summary-label">Absences</div>
        </div>
        <div class="summary-item">
            <div class="summary-value">{{ $absences->where('statut', 'retard')->count() }}</div>
            <div class="summary-label">Retards</div>
        </div>
        <div class="summary-item">
            <div class="summary-value">{{ $classe->etudiants->count() }}</div>
            <div class="summary-label">Étudiants</div>
        </div>
    </div>

    <div class="footer">
        <p>Généré le {{ $date_generation }}</p>
    </div>
</body>
</html>