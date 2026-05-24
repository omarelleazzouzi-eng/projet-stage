import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';

export default function EtudiantDashboard() {
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('accueil');
  const [cours, setCours] = useState([]);
  const [notification, setNotification] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profilRes, coursRes] = await Promise.all([
        api.get('/etudiant/profil'),
        api.get('/etudiant/mes-cours')
      ]);
      setProfil(profilRes.data);
      setCours(coursRes.data);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const downloadCours = async (coursId) => {
    try {
      const res = await api.get(`/cours/${coursId}/download`);
      if (res.data.url) {
        window.open(res.data.url, '_blank');
      }
    } catch (err) {
      showNotification('Erreur lors du téléchargement', 'error');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  const etudiant = profil?.etudiant;
  const stats = profil?.statistiques;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
          notification.type === 'error' ? 'bg-red-600' : 'bg-green-600'
        } text-white`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-6 mb-6 shadow-lg">
        <h1 className="text-3xl font-bold">Bienvenue, {etudiant?.nom} {etudiant?.prenom}</h1>
        <p className="opacity-90 mt-2">
          {etudiant?.classe?.nom} - {etudiant?.classe?.filiere?.nom}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm">Absences</p>
          <p className="text-3xl font-bold text-blue-600">{stats?.total_absences || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-red-500">
          <p className="text-gray-500 text-sm">Non justifiées</p>
          <p className="text-3xl font-bold text-red-600">{stats?.absences_non_justifiees || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-yellow-500">
          <p className="text-gray-500 text-sm">Retards</p>
          <p className="text-3xl font-bold text-yellow-600">{stats?.total_retards || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-500">
          <p className="text-gray-500 text-sm">Cours disponibles</p>
          <p className="text-3xl font-bold text-green-600">{cours.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('accueil')}
          className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
            activeTab === 'accueil' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          👤 Accueil
        </button>
        <button
          onClick={() => setActiveTab('absences')}
          className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
            activeTab === 'absences' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          📌 Mes absences
        </button>
        <button
          onClick={() => setActiveTab('cours')}
          className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
            activeTab === 'cours' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          📚 Mes cours
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        {activeTab === 'accueil' && (
          <div>
            <h2 className="text-xl font-bold mb-4">📋 Informations du compte</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-500 text-sm">CNE</p>
                <p className="font-mono font-medium text-lg">{etudiant?.cne}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-500 text-sm">Email</p>
                <p className="font-medium">{etudiant?.email}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-500 text-sm">Téléphone</p>
                <p className="font-medium">{etudiant?.telephone || '-'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-500 text-sm">Date de naissance</p>
                <p className="font-medium">{etudiant?.date_naissance || '-'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-500 text-sm">Classe</p>
                <p className="font-medium">{etudiant?.classe?.nom || '-'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-500 text-sm">Filière</p>
                <p className="font-medium">{etudiant?.classe?.filiere?.nom || '-'}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'absences' && (
          <div>
            <h2 className="text-xl font-bold mb-4">📌 Historique des absences</h2>
            {etudiant?.absences?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 text-left text-sm font-semibold text-gray-600">Date</th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-600">Matière</th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-600">Professeur</th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-600">Statut</th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-600">Justifiée</th>
                    </tr>
                  </thead>
                  <tbody>
                    {etudiant.absences.map(ab => (
                      <tr key={ab.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{ab.seance?.date}</td>
                        <td className="p-3">{ab.seance?.matiere?.nom}</td>
                        <td className="p-3 text-gray-600">
                          {ab.seance?.professor?.nom} {ab.seance?.professor?.prenom}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-sm font-medium ${
                            ab.statut === 'absent' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {ab.statut === 'absent' ? '✗ Absent' : '⏱ Retard'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={ab.est_justifiee ? 'text-green-600' : 'text-red-600'}>
                            {ab.est_justifiee ? '✓ Oui' : '✗ Non'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">✅</div>
                <p className="text-gray-500 text-lg">Aucune absence enregistrée.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'cours' && (
          <div>
            <h2 className="text-xl font-bold mb-4">📚 Cours et ressources</h2>
            {cours.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cours.map(c => (
                  <div key={c.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800">{c.titre}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        c.type === 'cours' ? 'bg-blue-100 text-blue-700' :
                        c.type === 'exercice' ? 'bg-green-100 text-green-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {c.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{c.matiere?.nom}</p>
                    <p className="text-sm text-gray-500 mb-3">{c.classe?.nom}</p>
                    <button
                      onClick={() => downloadCours(c.id)}
                      className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 text-sm"
                    >
                      📥 Télécharger
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-gray-500 text-lg">Aucun cours disponible pour le moment.</p>
                <p className="text-gray-400 text-sm mt-2">Revenez plus tard pour voir vos cours.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}