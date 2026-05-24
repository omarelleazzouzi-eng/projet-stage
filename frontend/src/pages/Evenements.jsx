import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function Evenements() {
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({
    titre: '', description: '', date_evenement: '', lieu: '',
    categorie: '', max_participants: '', club_id: ''
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [eventsRes, clubsRes] = await Promise.allSettled([
        api.get('/events'),
        api.get('/clubs')
      ]);
      if (eventsRes.status === 'fulfilled') setEvents(eventsRes.value.data || []);
      if (clubsRes.status === 'fulfilled') setClubs(clubsRes.value.data || []);
    } catch (err) {
      setError('Erreur lors du chargement des événements');
    } finally {
      setLoading(false);
    }
  };

  const notify = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const resetForm = () => {
    setFormData({ titre: '', description: '', date_evenement: '', lieu: '', categorie: '', max_participants: '', club_id: '' });
    setSelectedEvent(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (selectedEvent) {
        await api.put(`/events/${selectedEvent}`, formData);
        notify('Événement modifié avec succès');
      } else {
        await api.post('/events', formData);
        notify('Événement créé avec succès');
      }
      resetForm();
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur lors de l\'enregistrement';
      notify(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (event) => {
    setSelectedEvent(event.id);
    setFormData({
      titre: event.titre,
      description: event.description || '',
      date_evenement: event.date_evenement?.slice(0, 16) || '',
      lieu: event.lieu,
      categorie: event.categorie || '',
      max_participants: event.max_participants || '',
      club_id: event.club_id || ''
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Voulez-vous vraiment supprimer cet événement ?')) return;
    try {
      await api.delete(`/events/${id}`);
      notify('Événement supprimé');
      fetchData();
    } catch {
      notify('Erreur lors de la suppression', 'error');
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all ${notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {notification.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des Événements</h1>
          <p className="text-gray-500 text-sm mt-1">{events.length} événement(s) au total</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className={`px-5 py-2 rounded-lg font-medium transition-colors ${showForm ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          {showForm ? '✕ Annuler' : '+ Nouvel événement'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            {selectedEvent ? '✏️ Modifier l\'événement' : '➕ Créer un événement'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                <input
                  placeholder="Titre de l'événement"
                  value={formData.titre}
                  onChange={e => setFormData({ ...formData, titre: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  placeholder="Description (optionnel)"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date et heure *</label>
                <input
                  type="datetime-local"
                  value={formData.date_evenement}
                  onChange={e => setFormData({ ...formData, date_evenement: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lieu *</label>
                <input
                  placeholder="Ex: Salle polyvalente"
                  value={formData.lieu}
                  onChange={e => setFormData({ ...formData, lieu: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <input
                  placeholder="Ex: Conférence, Atelier..."
                  value={formData.categorie}
                  onChange={e => setFormData({ ...formData, categorie: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max participants</label>
                <input
                  type="number"
                  placeholder="Illimité si vide"
                  value={formData.max_participants}
                  onChange={e => setFormData({ ...formData, max_participants: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Club organisateur</label>
                <select
                  value={formData.club_id}
                  onChange={e => setFormData({ ...formData, club_id: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Aucun club</option>
                  {clubs.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
              >
                {saving ? 'Enregistrement...' : selectedEvent ? 'Mettre à jour' : 'Créer l\'événement'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700 flex items-center gap-3">
          <span>⚠️</span> {error}
          <button onClick={fetchData} className="ml-auto text-sm underline">Réessayer</button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && events.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-5xl mb-4">📅</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucun événement créé</h3>
          <p className="text-gray-500 mb-4">Créez votre premier événement en cliquant sur "Nouvel événement"</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Créer un événement
          </button>
        </div>
      )}

      {/* Events table */}
      {!loading && events.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Titre</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Date</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Lieu</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Club</th>
                <th className="p-4 text-center text-sm font-semibold text-gray-600">Participants</th>
                <th className="p-4 text-center text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.map(event => (
                <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-gray-800">{event.titre}</div>
                    {event.categorie && <div className="text-xs text-blue-600 mt-0.5">{event.categorie}</div>}
                  </td>
                  <td className="p-4 text-sm text-gray-600">{formatDate(event.date_evenement)}</td>
                  <td className="p-4 text-sm text-gray-600">{event.lieu}</td>
                  <td className="p-4 text-sm text-gray-600">{event.club?.nom || <span className="text-gray-400">-</span>}</td>
                  <td className="p-4 text-center text-sm">
                    <span className="font-medium">{event.registrations?.filter(r => r.statut !== 'annule').length || 0}</span>
                    {event.max_participants && <span className="text-gray-400"> / {event.max_participants}</span>}
                  </td>
                  <td className="p-4 text-center space-x-3">
                    <button
                      onClick={() => handleEdit(event)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
