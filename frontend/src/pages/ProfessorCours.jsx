import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function ProfessorCours() {
  const [classes, setClasses] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedClasse, setSelectedClasse] = useState('');
  const [selectedMatiere, setSelectedMatiere] = useState('');
  const [notification, setNotification] = useState(null);
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [classesRes, matieresRes, coursRes] = await Promise.all([
        api.get('/professor/classes'),
        api.get('/professor/matieres'),
        api.get('/professor/cours')
      ]);
      setClasses(classesRes.data);
      setMatieres(matieresRes.data);
      setCours(coursRes.data.data || coursRes.data);
    } catch (err) {
      showNotification('Erreur lors du chargement', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('cours-file');
    const titreInput = document.getElementById('cours-titre');
    const typeSelect = document.getElementById('cours-type');

    if (!fileInput.files[0] || !titreInput.value || !selectedClasse || !selectedMatiere) {
      showNotification('Veuillez remplir tous les champs', 'error');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('titre', titreInput.value);
    formData.append('classe_id', selectedClasse);
    formData.append('matiere_id', selectedMatiere);
    formData.append('type', typeSelect.value);
    formData.append('fichier', fileInput.files[0]);

    try {
      await api.post('/professor/cours', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showNotification('Cours uploadé avec succès!');
      fileInput.value = '';
      titreInput.value = '';
      document.getElementById('cours-type').value = 'cours';
      fetchData();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Erreur lors de l\'upload', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (coursId) => {
    if (!confirm('Supprimer ce fichier?')) return;
    
    try {
      await api.delete(`/professor/cours/${coursId}`);
      showNotification('Fichier supprimé');
      fetchData();
    } catch (err) {
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  const getTypeBadge = (type) => {
    const badges = {
      cours: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Cours' },
      exercice: { bg: 'bg-green-100', text: 'text-green-700', label: 'Exercice' },
      td: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'TD' },
      exam: { bg: 'bg-red-100', text: 'text-red-700', label: 'Examen' },
    };
    const b = badges[type] || badges.cours;
    return (
      <span className={`${b.bg} ${b.text} text-xs px-2 py-1 rounded-full font-medium`}>
        {b.label}
      </span>
    );
  };

  const filteredCours = cours.filter(c => 
    (!selectedClasse || c.classe_id === parseInt(selectedClasse)) &&
    (!selectedMatiere || c.matiere_id === parseInt(selectedMatiere)) &&
    (!filterType || c.type === filterType)
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
          notification.type === 'error' ? 'bg-red-600' : 'bg-green-600'
        } text-white`}>
          {notification.message}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Mes Cours</h1>
        <p className="text-gray-500">Gérer et partager vos ressources pédagogiques</p>
      </div>

      {/* Upload Form */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">📤 Uploader un nouveau fichier</h2>
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Classe</label>
              <select
                value={selectedClasse}
                onChange={(e) => setSelectedClasse(e.target.value)}
                className="w-full border rounded-lg p-2.5"
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
                value={selectedMatiere}
                onChange={(e) => setSelectedMatiere(e.target.value)}
                className="w-full border rounded-lg p-2.5"
                required
              >
                <option value="">Sélectionner...</option>
                {matieres.map(m => (
                  <option key={m.id} value={m.id}>{m.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Type de fichier</label>
              <select id="cours-type" className="w-full border rounded-lg p-2.5">
                <option value="cours">Cours</option>
                <option value="exercice">Exercice</option>
                <option value="td">TD</option>
                <option value="exam">Examen</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Titre</label>
              <input
                id="cours-titre"
                type="text"
                placeholder="ex: Chapitre 1: Introduction"
                className="w-full border rounded-lg p-2.5"
                required
              />
            </div>
          </div>
          
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">Fichier (PDF, DOC, PPT, XLSX)</label>
              <input
                id="cours-file"
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xlsx,.xls"
                className="w-full border rounded-lg p-2.5"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={uploading}
              className="bg-indigo-600 text-white px-8 py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {uploading ? '⏳ Upload...' : '📤 Uploader'}
            </button>
          </div>
        </form>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <span className="text-sm font-medium text-gray-600">Filtrer par:</span>
          <select
            value={selectedClasse}
            onChange={(e) => setSelectedClasse(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">Toutes les classes</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>
          <select
            value={selectedMatiere}
            onChange={(e) => setSelectedMatiere(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">Toutes les matières</option>
            {matieres.map(m => (
              <option key={m.id} value={m.id}>{m.nom}</option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">Tous les types</option>
            <option value="cours">Cours</option>
            <option value="exercice">Exercice</option>
            <option value="td">TD</option>
            <option value="exam">Examen</option>
          </select>
          {(selectedClasse || selectedMatiere || filterType) && (
            <button 
              onClick={() => { setSelectedClasse(''); setSelectedMatiere(''); setFilterType(''); }}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              ✕ Effacer
            </button>
          )}
          <span className="ml-auto text-sm text-gray-500">
            {filteredCours.length} fichier(s)
          </span>
        </div>
      </div>

      {/* Cours List */}
      {filteredCours.length > 0 ? (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Titre</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Classe</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Matière</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Type</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Date</th>
                <th className="p-4 text-center text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCours.map(c => (
                <tr key={c.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-medium text-gray-800">{c.titre}</div>
                  </td>
                  <td className="p-4 text-gray-600">{c.classe?.nom}</td>
                  <td className="p-4 text-gray-600">{c.matiere?.nom}</td>
                  <td className="p-4">{getTypeBadge(c.type)}</td>
                  <td className="p-4 text-gray-500 text-sm">
                    {c.created_at ? new Date(c.created_at).toLocaleDateString('fr-FR') : '-'}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      {c.fichier && (
                        <a
                          href={`/storage/${c.fichier}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 text-sm"
                        >
                          👁 Voir
                        </a>
                      )}
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 text-sm"
                      >
                        🗑 Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <p className="text-gray-500 text-lg">Aucun fichier uploadé</p>
          <p className="text-gray-400 text-sm mt-2">Utilisez le formulaire ci-dessus pour uploader vos premiers cours</p>
        </div>
      )}
    </div>
  );
}