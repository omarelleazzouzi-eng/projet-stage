<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string $role): Response
    {
        if (!$request->user()) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        if ($request->user()->role !== $role) {
            return response()->json(['error' => 'Accès refusé. Rôle requis: ' . $role], 403);
        }

        return $next($request);
    }
}