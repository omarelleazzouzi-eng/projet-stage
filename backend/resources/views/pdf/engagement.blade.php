<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Engagement - {{ $etudiant->cne }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #2563eb; }
        .header h1 { font-size: 28px; color: #2563eb; text-transform: uppercase; margin-bottom: 10px; }
        .header p { color: #666; font-size: 14px; }
        .title { font-size: 20px; font-weight: bold; text-align: center; margin: 30px 0; color: #059669; }
        .info-box { background: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .info-box p { margin: 8px 0; }
        .info-box strong { color: #1f2937; }
        .content { line-height: 2; text-align: justify; margin: 20px 0; }
        .engagements { margin: 30px 0; padding-left: 20px; }
        .engagements li { margin: 15px 0; }
        .signature { margin-top: 60px; display: flex; justify-content: space-between; }
        .signature-block { text-align: center; width: 45%; }
        .signature-line { border-top: 1px solid #333; margin-top: 60px; padding-top: 10px; }
        .footer { margin-top: 40px; text-align: right; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Établissement BTS</h1>
        <p>Gestion des Absences - Système Automatisé</p>
    </div>

    <div class="title">ENGAGEMENT DE L'ÉTUDIANT</div>

    <div class="info-box">
        <p><strong>Nom et Prénom:</strong> {{ $etudiant->nom }} {{ $etudiant->prenom }}</p>
        <p><strong>CNE:</strong> {{ $etudiant->cne }}</p>
        <p><strong>Classe:</strong> {{ $etudiant->classe->nom ?? 'N/A' }}</p>
        <p><strong>Filière:</strong> {{ $etudiant->classe->filiere->nom ?? 'N/A' }}</p>
    </div>

    <div class="content">
        <p>Je soussigné(e), <strong>{{ $etudiant->nom }} {{ $etudiant->prenom }}</strong>, étudiant(e) en classe de <strong>{{ $etudiant->classe->nom ?? 'N/A' }}</strong>, m'engage solennellement à :</p>
        
        <ul class="engagements">
            <li>✅ Assister régulièrement à tous mes cours et être présent(e) à l'heure</li>
            <li>✅ Justifier toute absence dans les 48 heures auprès de l'administration</li>
            <li>✅ Respecter le règlement intérieur de l'établissement</li>
            <li>✅ Informer mes parents/tuteurs de toute absence</li>
            <li>✅ Faire de mon mieux pour réussir ma scolarité</li>
            <li>✅ Ne pas dépasser le seuil d'absences autorisé (16 heures)</li>
        </ul>

        <p>Je prends conscience que les absences répétées et non justifiées peuvent entrainer :</p>
        <ul class="engagements">
            <li>⚠️ Des sanctions administratives (avertissements, convoquations)</li>
            <li>⚠️ La non-admission aux examens</li>
            <li>⚠️ Le redoublement ou l'exclusion</li>
        </ul>

        <p>Cet engagement est pris en toute connaissance des règles de l'établissement.</p>
    </div>

    <div class="footer">
        <p>Fait le {{ $date }}</p>
    </div>

    <div class="signature">
        <div class="signature-block">
            <div class="signature-line">Signature de l'étudiant</div>
        </div>
        <div class="signature-block">
            <div class="signature-line">Signature des parents/tuteurs</div>
        </div>
    </div>
</body>
</html>