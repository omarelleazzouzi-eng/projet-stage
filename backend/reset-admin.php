<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::where('email', 'admin@gestion-absences.com')->first();

if ($user) {
    $user->password = Hash::make('admin123');
    $user->save();
    echo "Password reset! New hash: " . $user->password . "\n";
} else {
    echo "User not found!\n";
}