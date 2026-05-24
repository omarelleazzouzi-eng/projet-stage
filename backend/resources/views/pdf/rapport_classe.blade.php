<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Rapport d'absences - {{ $classe->nom }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 30px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #2563eb; }
        .header h1 { font-size: 24px; color: #2563eb; text-transform: uppercase; margin-bottom: 10px; }
        .header p { color: #666; font-size: 14px; }
        .info-classe { background: #f3f4f6; padding: 15px; margin: 20px 0; border-radius: 8px; text-align: center; }
        .info-classe h2 { font-size: 18px; color: #1f2937; margin-bottom: 5px; }
        .info-classe p { color: #666; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px; }
        th { background: #2563eb; color: white; padding: 12px; text-align: left; font-weight: bold; }
        td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
        tr:nth-child(even) { background: #f9fafb; }
        tr:hover { background: #eff6ff; }
        .warning { background: #fef3c7; color: #92400e; padding: 8px 12px; border-radius: 4px; display: inline-block; }
        .critical { background: #fee2e2; color: #991b1b; padding: 8px 12px; border-radius: 4px; display: inline-block; font-weight: bold; }
        .summary { margin-top: 30px; padding: 20px; background: #f3f4f6; border-radius: 8px; }
        .summary h3 { margin-bottom: 15px; color: #1f2937; }
        .summary-grid { display: flex; justify-content: space-around; }
        .summary-item { text-align: center; }
        .summary-value { font-size: 28px; font-weight: bold; color: #2563eb; }
        .summary-label { font-size: 12px; color: #666; }
        .footer { margin-top: 40px; text-align: right; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>BTS - Rapport d'Absences</h1>
        <p>Établissement BTS Taza - Gestion des Absences</p>
    </div>

    <div class="info-classe">
        <h2>{{ $classe->nom }}</h2>
        <p>{{ $classe->filiere->nom ?? 'N/A' }} | {{ $classe->niveau->nom ?? 'N/A' }}</p>
        <p>Année scolaire: {{ $classe->annee_scolaire }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Nom et Prénom</th>
                <th>CNE</th>
                <th>Email</th>
                <th>Nb Absences</th>
                <th>Heures</th>
                <th>Statut</th>
            </tr>
        </thead>
        <tbody>
            @foreach($etudiants as $index => $etudiant)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td><strong>{{ $etudiant['nom'] }} {{ $etudiant['prenom'] }}</strong></td>
                <td>{{ $etudiant['cne'] }}</td>
                <td>{{ $etudiant['email'] ?? 'N/A' }}</td>
                <td>{{ $etudiant['total_absences'] }}</td>
                <td><strong>{{ $etudiant['total_heures'] }}h</strong></td>
                <td>
                    @if($etudiant['total_heures'] >= 10)
                        <span class="critical">⚠️ Avertissement</span>
                    @elseif($etudiant['total_heures'] >= 5)
                        <span class="warning">Attention</span>
                    @else
                        <span style="color: #059669;">✓ Normal</span>
                    @endif
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="summary">
        <h3>Résumé</h3>
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-value">{{ $etudiants->count() }}</div>
                <div class="summary-label">Total Étudiants</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">{{ $etudiants->sum('total_absences') }}</div>
                <div class="summary-label">Total Absences</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">{{ $etudiants->sum('total_heures') }}h</div>
                <div class="summary-label">Total Heures</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">{{ $etudiants->filter(fn($e) => $e['total_heures'] >= 10)->count() }}</div>
                <div class="summary-label">Avertissements</div>
            </div>
        </div>
    </div>

    <div class="footer">
        <p>Rapport généré le {{ $date_generation }}</p>
        <p>BTS Taza - Centre de Formation Professionnelle</p>
    </div>
</body>
</html>