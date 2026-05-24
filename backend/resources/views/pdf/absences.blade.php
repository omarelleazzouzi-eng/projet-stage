<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Rapport des Absences</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h1 { font-size: 18px; color: #2563eb; }
        .meta { font-size: 10px; color: #666; margin-bottom: 15px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 6px; text-align: left; font-size: 10px; }
        th { background: #f3f4f6; font-weight: bold; }
        .badge { padding: 2px 6px; border-radius: 3px; font-size: 9px; }
        .badge-absent { background: #fee2e2; color: #dc2626; }
        .badge-retard { background: #fef3c7; color: #d97706; }
        .badge-present { background: #d1fae5; color: #059669; }
        .footer { margin-top: 20px; text-align: right; font-size: 10px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Rapport des Absences</h1>
        <div class="meta">
            Généré le: {{ $date_generation }}
            @if(isset($filtres['classe_id']))<br>Classe: {{ $filtres['classe_id'] }}@endif
            @if(isset($filtres['date_debut']))<br>Période: {{ $filtres['date_debut'] }} - {{ $filtres['date_fin'] ?? 'Maintenant' }}@endif
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Étudiant</th>
                <th>Classe</th>
                <th>Matière</th>
                <th>Statut</th>
                <th>Justifiée</th>
            </tr>
        </thead>
        <tbody>
            @foreach($absences as $absence)
            <tr>
                <td>{{ $absence->seance->date ?? 'N/A' }}</td>
                <td>{{ $absence->etudiant->nom ?? '' }} {{ $absence->etudiant->prenom ?? '' }}</td>
                <td>{{ $absence->etudiant->classe->nom ?? 'N/A' }}</td>
                <td>{{ $absence->seance->matiere->nom ?? 'N/A' }}</td>
                <td>
                    <span class="badge badge-{{ $absence->statut }}">
                        {{ ucfirst($absence->statut) }}
                    </span>
                </td>
                <td>{{ $absence->est_justifiee ? 'Oui' : 'Non' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        Total: {{ $absences->count() }} enregistrements
    </div>
</body>
</html>