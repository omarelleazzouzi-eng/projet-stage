<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$events = App\Models\Event::all();
echo "Events in database:\n";
foreach ($events as $e) {
    echo "- {$e->titre} | est_active: " . ($e->est_active ? 'true' : 'false') . " | date: {$e->date_evenement}\n";
}

$cours = App\Models\Cours::all();
echo "\nCours in database:\n";
echo "Count: " . $cours->count() . "\n";