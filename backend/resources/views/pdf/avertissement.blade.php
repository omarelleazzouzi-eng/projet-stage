<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Avertissement d'absence - {{ $etudiant->cne }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #2563eb; }
        .header h1 { font-size: 28px; color: #2563eb; text-transform: uppercase; margin-bottom: 10px; }
        .header p { color: #666; font-size: 14px; }
        .title { font-size: 20px; font-weight: bold; text-align: center; margin: 30px 0; color: #dc2626; }
        .info-box { background: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .info-box p { margin: 8px 0; }
        .info-box strong { color: #1f2937; }
        .content { line-height: 1.8; text-align: justify; margin: 20px 0; }
        .stats { display: flex; justify-content: space-around; margin: 30px 0; }
        .stat { text-align: center; padding: 15px; background: #eff6ff; border-radius: 8px; }
        .stat-value { font-size: 24px; font-weight: bold; color: #2563eb; }
        .stat-label { font-size: 12px; color: #666; }
        .footer { margin-top: 50px; text-align: right; padding-top: 20px; border-top: 1px solid #ddd; }
        .signature { margin-top: 40px; display: flex; justify-content: space-between; }
        .signature-block { text-align: center; width: 45%; }
        .signature-line { border-top: 1px solid #333; margin-top: 60px; padding-top: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Établissement BTS</h1>
        <p>Gestion des Absences - Système Automatisé</p>
    </div>

    <div class="title">AVERTISSEMENT D'ABSENCE</div>

    <div class="info-box">
        <p><strong>Nom et Prénom:</strong> {{ $etudiant->nom }} {{ $etudiant->prenom }}</p>
        <p><strong>CNE:</strong> {{ $etudiant->cne }}</p>
        <p><strong>Classe:</strong> {{ $etudiant->classe->nom ?? 'N/A' }}</p>
        <p><strong>Filière:</strong> {{ $etudiant->classe->filiere->nom ?? 'N/A' }}</p>
        <p><strong>Email:</strong> {{ $etudiant->email ?? 'N/A' }}</p>
    </div>

    <div class="content">
        <p>Madame, Monsieur,</p>
        <br>
        <p>Nous avons le regret de vous informer que <strong>{{ $etudiant->nom }} {{ $etudiant->prenom }}</strong> (CNE: {{ $etudiant->cne }}) a accumulé <strong>{{ $totalHeures }} heures d'absence</strong> durant cette période scolaire.</p>
        @if($totalHeures >= 10)
        <p style="color: #dc2626; font-weight: bold; margin-top: 15px;">⚠️ ATTENTION: Le seuil critique de 10 heures d'absence a été dépassé.</p>
        <p>Cette situation peut avoir des conséquences graves sur la validation de son année scolaire et peut entraîner des mesures disciplinaires.</p>
        @endif
        <br>
        <p>Nous vous prions de bien vouloir prendre les dispositions nécessaires pour remédier à cette situation dans les plus brefs délais.</p>
    </div>

    <div class="stats">
        <div class="stat">
            <div class="stat-value">{{ $totalAbsences }}</div>
            <div class="stat-label">Total Absences</div>
        </div>
        <div class="stat">
            <div class="stat-value">{{ $totalHeures }} h</div>
            <div class="stat-label">Heures d'Absence</div>
        </div>
        <div class="stat">
            <div class="stat-value">{{ $nonJustifiees }}</div>
            <div class="stat-label">Non Justifiées</div>
        </div>
    </div>

    <div class="footer">
        <p>Fait le {{ $date }}</p>
        <p>La Direction</p>
    </div>

    <div class="signature">
        <div class="signature-block">
            <div class="signature-line">Signature des parents</div>
        </div>
        <div class="signature-block">
            <div class="signature-line">Direction</div>
        </div>
    </div>
</body>
</html>