import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function MesSeances() {
  const [classes, setClasses] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [seances, setSeances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('seances');
  const [selectedSeance, setSelectedSeance] = useState(null);
  const [etudiants, setEtudiants] = useState([]);
  const [presences, setPresences] = useState({});
  const [formData, setFormData] = useState({
    classe_id: '',
    matiere_id: '',
    date: '',
    heure_debut: '08:00',
    heure_fin: '10:00'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [classesRes, matieresRes, seancesRes] = await Promise.all([
        api.get('/professor/classes'),
        api.get('/professor/matieres'),
        api.get('/seances')
      ]);
      setClasses(classesRes.data);
      setMatieres(matieresRes.data);
      setSeances(seancesRes.data.data || seancesRes.data);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSeance = async (e) => {
    e.preventDefault();
    try {
      await api.post('/seances', formData);
      setShowForm(false);
      setFormData({
        classe_id: '',
        matiere_id: '',
        date: '',
        heure_debut: '08:00',
        heure_fin: '10:00'
      });
      fetchData();
    } catch (err) {
      alert('Erreur lors de la création de la séance');
    }
  };

  const openSeance = async (seance) => {
    setSelectedSeance(seance);
    try {
      const res = await api.get(`/seances/${seance.id}`);
      const seanceData = res.data;
      setEtudiants(seanceData.classe?.etudiants || []);
      
      // Initialiser les présences
      const initialPresences = {};
      seanceData.classe?.etudiants?.forEach(etudiant => {
        const existingAbsence = seanceData.absences?.find(a => a.etudiant_id === etudiant.id);
        initialPresences[etudiant.id] = existingAbsence ? 'absent' : 'present';
      });
      setPresences(initialPresences);
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const savePresences = async () => {
    if (!selectedSeance) return;
    
    const absences = Object.entries(presences).map(([etudiantId, statut]) => ({
      etudiant_id: parseInt(etudiantId),
      statut
    }));

    try {
      await api.post(`/seances/${selectedSeance.id}/absences`, { absences });
      alert('Présences enregistrées avec succès!');
      setSelectedSeance(null);
      fetchData();
    } catch (err) {
      alert('Erreur: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleUploadCours = async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('cours-file');
    const titreInput = document.getElementById('cours-titre');
    
    if (!fileInput.files[0] || !titreInput.value) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append('titre', titreInput.value);
    formDataUpload.append('classe_id', formData.classe_id);
    formDataUpload.append('matiere_id', formData.matiere_id);
    formDataUpload.append('fichier', fileInput.files[0]);

    try {
      await api.post('/cours/upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Cours uploadé avec succès!');
      fileInput.value = '';
      titreInput.value = '';
    } catch (err) {
      alert('Erreur lors de l\'upload');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  // Modal de gestion des présences
  if (selectedSeance) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Émargement - {selectedSeance.matiere?.nom}</h1>
            <p className="text-gray-500">{selectedSeance.classe?.nom} | {selectedSeance.date} | {selectedSeance.heure_debut} - {selectedSeance.heure_fin}</p>
          </div>
          <button 
            onClick={() => setSelectedSeance(null)}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            ← Retour
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 bg-blue-50 border-b">
            <div className="flex justify-between items-center">
              <span className="font-medium">Liste des étudiants</span>
              <button 
                onClick={savePresences}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
              >
                ✓ Enregistrer les présences
              </button>
            </div>
          </div>
          
          <div className="divide-y">
            {etudiants.map(etudiant => (
              <div key={etudiant.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <span className="font-medium">{etudiant.nom} {etudiant.prenom}</span>
                  <span className="text-gray-500 text-sm ml-2">({etudiant.cne})</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPresences({...presences, [etudiant.id]: 'present'})}
                    className={`px-4 py-2 rounded ${presences[etudiant.id] === 'present' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                  >
                    ✓ Présent
                  </button>
                  <button
                    onClick={() => setPresences({...presences, [etudiant.id]: 'absent'})}
                    className={`px-4 py-2 rounded ${presences[etudiant.id] === 'absent' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                  >
                    ✗ Absent
                  </button>
                  <button
                    onClick={() => setPresences({...presences, [etudiant.id]: 'retard'})}
                    className={`px-4 py-2 rounded ${presences[etudiant.id] === 'retard' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                  >
                    ⏱ Retard
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mes Séances</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? 'Annuler' : '+ Nouvelle séance'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('seances')}
          className={`px-4 py-2 rounded-lg ${activeTab === 'seances' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
        >
          Séances
        </button>
        <button
          onClick={() => setActiveTab('cours')}
          className={`px-4 py-2 rounded-lg ${activeTab === 'cours' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
        >
          Upload cours
        </button>
      </div>

      {/* Create Seance Form */}
      {showForm && activeTab === 'seances' && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="font-semibold mb-4">Créer une nouvelle séance</h3>
          <form onSubmit={handleCreateSeance} className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Classe</label>
              <select
                value={formData.classe_id}
                onChange={(e) => setFormData({...formData, classe_id: e.target.value})}
                className="w-full border rounded p-2"
                required
              >
                <option value="">Sélectionner...</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Matière</label>
              <select
                value={formData.matiere_id}
                onChange={(e) => setFormData({...formData, matiere_id: e.target.value})}
                className="w-full border rounded p-2"
                required
              >
                <option value="">Sélectionner...</option>
                {matieres.map(m => (
                  <option key={m.id} value={m.id}>{m.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full border rounded p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Heure début</label>
              <input
                type="time"
                value={formData.heure_debut}
                onChange={(e) => setFormData({...formData, heure_debut: e.target.value})}
                className="w-full border rounded p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Heure fin</label>
              <input
                type="time"
                value={formData.heure_fin}
                onChange={(e) => setFormData({...formData, heure_fin: e.target.value})}
                className="w-full border rounded p-2"
                required
              />
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
                Créer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Upload Cours Form */}
      {activeTab === 'cours' && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="font-semibold mb-4">Uploader un cours (PDF)</h3>
          <form onSubmit={handleUploadCours} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Classe</label>
                <select
                  id="cours-classe"
                  value={formData.classe_id}
                  onChange={(e) => setFormData({...formData, classe_id: e.target.value})}
                  className="w-full border rounded p-2"
                  required
                >
                  <option value="">Sélectionner...</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Matière</label>
                <select
                  id="cours-matiere"
                  value={formData.matiere_id}
                  onChange={(e) => setFormData({...formData, matiere_id: e.target.value})}
                  className="w-full border rounded p-2"
                  required
                >
                  <option value="">Sélectionner...</option>
                  {matieres.map(m => (
                    <option key={m.id} value={m.id}>{m.nom}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Titre du cours</label>
              <input
                id="cours-titre"
                type="text"
                placeholder="Chapitre 1: Introduction..."
                className="w-full border rounded p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Fichier (PDF)</label>
              <input
                id="cours-file"
                type="file"
                accept=".pdf"
                className="w-full border rounded p-2"
                required
              />
            </div>
            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700">
              Uploader le cours
            </button>
          </form>
        </div>
      )}

      {/* Seances List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Classe</th>
              <th className="p-3 text-left">Matière</th>
              <th className="p-3 text-left">Horaire</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {seances && seances.length > 0 ? (
              seances.map(seance => (
                <tr key={seance.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{seance.date}</td>
                  <td className="p-3">{seance.classe?.nom}</td>
                  <td className="p-3">{seance.matiere?.nom}</td>
                  <td className="p-3">{seance.heure_debut} - {seance.heure_fin}</td>
                  <td className="p-3 text-center">
                    <button 
                      onClick={() => openSeance(seance)}
                      className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 text-sm"
                    >
                      Émargement
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">
                  Aucune séance trouvée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}