import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';

export default function MesEvenements() {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('evenements');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eventsRes, regsRes] = await Promise.all([
        api.get('/events?statut=upcoming'),
        api.get('/events/mes-inscriptions')
      ]);
      setEvents(eventsRes.data);
      setRegistrations(regsRes.data);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    try {
      await api.post(`/events/${eventId}/register`);
      alert('Inscription réussie!');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur lors de l\'inscription');
    }
  };

  const handleUnregister = async (eventId) => {
    if (!confirm('Voulez-vous annuler votre inscription?')) return;
    try {
      await api.delete(`/events/${eventId}/unregister`);
      alert('Inscription annulée');
      fetchData();
    } catch (err) {
      alert('Erreur lors de l\'annulation');
    }
  };

  const isRegistered = (eventId) => registrations.some(r => r.event_id === eventId);

  const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) return <div className="p-8 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div></div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Événements</h1>

      <div className="flex gap-4 mb-6">
        <button onClick={() => setActiveTab('evenements')} className={`px-4 py-2 rounded ${activeTab === 'evenements' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
          Événements à venir
        </button>
        <button onClick={() => setActiveTab('inscriptions')} className={`px-4 py-2 rounded ${activeTab === 'inscriptions' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
          Mes inscriptions ({registrations.length})
        </button>
      </div>

      {activeTab === 'evenements' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => {
            const registered = isRegistered(event.id);
            const placesRestantes = event.max_participants 
              ? event.max_participants - (event.registrations?.filter(r => r.statut !== 'annule').length || 0)
              : null;
            
            return (
              <div key={event.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">{event.categorie || 'Événement'}</span>
                    {event.club && <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded">{event.club.nom}</span>}
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{event.titre}</h3>
                  {event.description && <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>}
                  <div className="space-y-1 text-sm text-gray-500 mb-4">
                    <p>📅 {formatDate(event.date_evenement)}</p>
                    <p>📍 {event.lieu}</p>
                    {placesRestantes !== null && <p>👥 {placesRestantes} places restantes</p>}
                  </div>
                  {registered ? (
                    <button onClick={() => handleUnregister(event.id)} className="w-full bg-red-100 text-red-700 py-2 rounded hover:bg-red-200">
                      Annuler l'inscription
                    </button>
                  ) : (
                    <button onClick={() => handleRegister(event.id)} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                      S'inscrire
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'inscriptions' && (
        <div className="space-y-4">
          {registrations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-5xl mb-4">📅</div>
              <p>Vous n'êtes inscrit à aucun événement</p>
            </div>
          ) : (
            registrations.map(reg => (
              <div key={reg.id} className="bg-white rounded-lg shadow border p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{reg.event?.titre}</h3>
                  <p className="text-sm text-gray-500">📅 {formatDate(reg.event?.date_evenement)} | 📍 {reg.event?.lieu}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded text-sm ${reg.statut === 'confirme' ? 'bg-green-100 text-green-700' : reg.statut === 'en_attente' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    {reg.statut === 'confirme' ? 'Confirmé' : reg.statut === 'en_attente' ? 'En attente' : 'Annulé'}
                  </span>
                  <button onClick={() => handleUnregister(reg.event_id)} className="text-red-600 hover:underline">Annuler</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}