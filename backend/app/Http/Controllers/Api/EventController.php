<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventRegistration;
use App\Models\Club;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EventController extends Controller
{
    // Public - list all active events
    public function publicIndex()
    {
        $events = Event::where('est_active', true)
            ->with(['club', 'user'])
            ->orderBy('date_evenement', 'desc')
            ->get();
        
        return response()->json($events);
    }

    // List all events (admin/director)
    public function index(Request $request)
    {
        $query = Event::with(['club', 'user', 'registrations']);
        
        if ($request->club_id) {
            $query->where('club_id', $request->club_id);
        }
        
        if ($request->statut === 'upcoming') {
            $query->where('date_evenement', '>=', now());
        } elseif ($request->statut === 'past') {
            $query->where('date_evenement', '<', now());
        }
        
        return response()->json($query->orderBy('date_evenement', 'desc')->get());
    }

    // Create event (director/admin)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'titre' => 'required',
            'description' => 'nullable',
            'date_evenement' => 'required|date',
            'lieu' => 'required',
            'categorie' => 'nullable',
            'max_participants' => 'nullable|integer',
            'club_id' => 'nullable|exists:clubs,id',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('events', 'public');
        }

        $validated['user_id'] = $request->user()->id;
        $validated['est_active'] = true;

        $event = Event::create($validated);

        return response()->json([
            'message' => 'Événement créé avec succès',
            'event' => $event->load(['club', 'user'])
        ], 201);
    }

    // Update event
    public function update(Request $request, Event $event)
    {
        $validated = $request->validate([
            'titre' => 'required',
            'description' => 'nullable',
            'date_evenement' => 'required|date',
            'lieu' => 'required',
            'categorie' => 'nullable',
            'max_participants' => 'nullable|integer',
            'club_id' => 'nullable|exists:clubs,id',
            'est_active' => 'boolean',
        ]);

        if ($request->hasFile('image')) {
            if ($event->image) {
                Storage::disk('public')->delete($event->image);
            }
            $validated['image'] = $request->file('image')->store('events', 'public');
        }

        $event->update($validated);

        return response()->json([
            'message' => 'Événement mis à jour',
            'event' => $event->load(['club', 'user'])
        ]);
    }

    // Delete event
    public function destroy(Event $event)
    {
        if ($event->image) {
            Storage::disk('public')->delete($event->image);
        }
        $event->delete();

        return response()->json(['message' => 'Événement supprimé']);
    }

    // Get event details with registrations
    public function show(Event $event)
    {
        $event->load(['club', 'user', 'registrations.etudiant.user']);
        
        return response()->json($event);
    }

    // Register to event (student)
    public function register(Request $request, Event $event)
    {
        $user = $request->user();
        
        if (!$user->etudiant) {
            return response()->json(['error' => 'Vous devez être étudiant pour vous inscrire'], 403);
        }

        $etudiantId = $user->etudiant->id;

        $existing = EventRegistration::where('event_id', $event->id)
            ->where('etudiant_id', $etudiantId)
            ->first();

        if ($existing) {
            if ($existing->statut === 'annule') {
                $existing->update(['statut' => 'confirme']);
                return response()->json(['message' => 'Inscription confirmée']);
            }
            return response()->json(['error' => 'Vous êtes déjà inscrit à cet événement'], 400);
        }

        if ($event->max_participants) {
            $count = EventRegistration::where('event_id', $event->id)
                ->where('statut', '!=', 'annule')
                ->count();
            if ($count >= $event->max_participants) {
                return response()->json(['error' => 'Nombre maximum de participants atteint'], 400);
            }
        }

        EventRegistration::create([
            'event_id' => $event->id,
            'etudiant_id' => $etudiantId,
            'statut' => 'confirme'
        ]);

        return response()->json(['message' => 'Inscription réussie']);
    }

    // Unregister from event
    public function unregister(Request $request, Event $event)
    {
        $user = $request->user();
        
        if (!$user->etudiant) {
            return response()->json(['error' => 'Vous devez être étudiant'], 403);
        }

        $registration = EventRegistration::where('event_id', $event->id)
            ->where('etudiant_id', $user->etudiant->id)
            ->first();

        if (!$registration) {
            return response()->json(['error' => 'Vous n\'êtes pas inscrit à cet événement'], 404);
        }

        $registration->delete();

        return response()->json(['message' => 'Inscription annulée']);
    }

    // Get my registrations (student)
    public function myRegistrations(Request $request)
    {
        $user = $request->user();
        
        if (!$user->etudiant) {
            return response()->json(['error' => 'Vous devez être étudiant'], 403);
        }

        $registrations = EventRegistration::where('etudiant_id', $user->etudiant->id)
            ->with(['event.club'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($registrations);
    }

    // Update registration status (admin)
    public function updateRegistration(Request $request, EventRegistration $registration)
    {
        $request->validate(['statut' => 'required|in:en_attente,confirme,annule']);
        
        $registration->update(['statut' => $request->statut]);

        return response()->json(['message' => 'Statut mis à jour']);
    }

    // Clubs management
    public function indexClubs()
    {
        return response()->json(Club::where('est_active', true)->get());
    }

    public function storeClub(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required',
            'description' => 'nullable',
        ]);

        if ($request->hasFile('logo')) {
            $validated['logo'] = $request->file('logo')->store('clubs', 'public');
        }

        $validated['responsable_id'] = $request->user()->id;

        $club = Club::create($validated);

        return response()->json(['message' => 'Club créé', 'club' => $club], 201);
    }

    public function destroyClub(Club $club)
    {
        if ($club->logo) {
            Storage::disk('public')->delete($club->logo);
        }
        $club->delete();

        return response()->json(['message' => 'Club supprimé']);
    }
}