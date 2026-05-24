import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Etudiants() {
  const [etudiants, setEtudiants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [classes, setClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    cne: '', nom: '', prenom: '', email: '', date_naissance: '', lieu_naissance: '', classe_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [etudiantsRes, classesRes] = await Promise.all([
        api.get('/etudiants'),
        api.get('/classes')
      ]);
      setEtudiants(etudiantsRes.data.data);
      setClasses(classesRes.data);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/etudiants', formData);
      setShowForm(false);
      setFormData({ cne: '', nom: '', prenom: '', email: '', date_naissance: '', lieu_naissance: '', classe_id: '' });
      fetchData();
    } catch (err) {
      alert('Erreur lors de la création: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Voulez-vous supprimer cet étudiant?')) {
      try {
        await api.delete(`/etudiants/${id}`);
        fetchData();
      } catch (err) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleToggleActive = async (etudiant) => {
    try {
      if (etudiant.user?.is_active) {
        await api.post(`/inscriptions/${etudiant.user_id}/rejeter`);
      } else {
        await api.post(`/inscriptions/${etudiant.user_id}/valider`);
      }
      fetchData();
    } catch (err) {
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const filteredEtudiants = etudiants.filter(et => 
    et.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    et.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    et.cne.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des étudiants</h1>
        <div className="flex gap-2">
          <Link 
            to="/classes"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            📥 Importer (via Classes)
          </Link>
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {showForm ? 'Annuler' : '➕ Ajouter'}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher par nom, prénom ou CNE..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md border rounded p-2"
        />
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="font-semibold mb-4">Ajouter un nouvel étudiant</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">CNE *</label>
              <input 
                placeholder="P123456" 
                value={formData.cne} 
                onChange={(e) => setFormData({...formData, cne: e.target.value})} 
                className="w-full border p-2 rounded" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Nom *</label>
              <input 
                placeholder="Nom" 
                value={formData.nom} 
                onChange={(e) => setFormData({...formData, nom: e.target.value})} 
                className="w-full border p-2 rounded" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Prénom *</label>
              <input 
                placeholder="Prénom" 
                value={formData.prenom} 
                onChange={(e) => setFormData({...formData, prenom: e.target.value})} 
                className="w-full border p-2 rounded" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input 
                placeholder="email@exemple.com" 
                type="email"
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                className="w-full border p-2 rounded" 
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Date de naissance *</label>
              <input 
                type="date" 
                value={formData.date_naissance} 
                onChange={(e) => setFormData({...formData, date_naissance: e.target.value})} 
                className="w-full border p-2 rounded" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Lieu de naissance</label>
              <input 
                placeholder="Ville" 
                value={formData.lieu_naissance} 
                onChange={(e) => setFormData({...formData, lieu_naissance: e.target.value})} 
                className="w-full border p-2 rounded" 
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Classe *</label>
              <select 
                value={formData.classe_id} 
                onChange={(e) => setFormData({...formData, classe_id: e.target.value})} 
                className="w-full border p-2 rounded" 
                required
              >
                <option value="">Sélectionner une classe</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.nom} ({c.filiere?.nom})</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">CNE</th>
              <th className="p-3 text-left">Nom</th>
              <th className="p-3 text-left">Prénom</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Classe</th>
              <th className="p-3 text-center">Statut</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEtudiants.length > 0 ? (
              filteredEtudiants.map((et) => {
                const isActive = et.user?.is_active;
                return (
                <tr key={et.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-mono text-sm">{et.cne}</td>
                  <td className="p-3 font-medium">{et.nom}</td>
                  <td className="p-3">{et.prenom}</td>
                  <td className="p-3 text-gray-600">{et.email || '-'}</td>
                  <td className="p-3">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                      {et.classe?.nom || 'Non assigné'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button 
                      onClick={() => handleToggleActive(et)}
                      className={`px-3 py-1 rounded text-xs font-medium ${isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}`}
                    >
                      {isActive ? '✓ Actif' : '⏳ En attente'}
                    </button>
                  </td>
                  <td className="p-3 text-center space-x-2">
                    <button 
                      onClick={() => handleToggleActive(et)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                      title={isActive ? 'Désactiver' : 'Activer'}
                    >
                      {isActive ? 'Désactiver' : 'Activer'}
                    </button>
                    <button 
                      onClick={() => handleDelete(et.id)} 
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              )})
            ) : (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-500">
                  {searchTerm ? 'Aucun étudiant trouvé' : 'Aucun étudiant'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {filteredEtudiants.length > 0 && (
          <div className="p-4 bg-gray-50 border-t text-sm text-gray-600">
            Total: {filteredEtudiants.length} étudiant(s)
          </div>
        )}
      </div>
    </div>
  );
}