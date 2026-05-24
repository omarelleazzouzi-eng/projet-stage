import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function Professeurs() {
  const [professeurs, setProfesseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    cin: '', nom: '', prenom: '', email: '', telephone: '',
    matieres: [], classes: []
  });
  const [matieres, setMatieres] = useState([]);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profsRes, matieresRes, classesRes] = await Promise.all([
        api.get('/professeurs'),
        api.get('/matieres'),
        api.get('/classes')
      ]);
      setProfesseurs(profsRes.data);
      setMatieres(matieresRes.data);
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
      const res = await api.post('/professeurs', formData);
      if (formData.matieres.length > 0) {
        await api.post(`/professeurs/${res.data.id}/matieres`, { matiere_ids: formData.matieres });
      }
      if (formData.classes.length > 0) {
        await api.post(`/professeurs/${res.data.id}/classes`, { classe_ids: formData.classes });
      }
      setShowForm(false);
      setFormData({ cin: '', nom: '', prenom: '', email: '', telephone: '', matieres: [], classes: [] });
      fetchData();
    } catch (err) {
      alert('Erreur: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Supprimer ce professeur?')) {
      await api.delete(`/professeurs/${id}`);
      fetchData();
    }
  };

  const toggleSelection = (list, item, setList) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Professeurs</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? 'Annuler' : 'Ajouter un professeur'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Nouveau professeur</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input 
                placeholder="CIN" 
                value={formData.cin} 
                onChange={e => setFormData({...formData, cin: e.target.value})}
                className="border p-2 rounded"
                required
              />
              <input 
                placeholder="Email" 
                type="email"
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="border p-2 rounded"
                required
              />
              <input 
                placeholder="Nom" 
                value={formData.nom} 
                onChange={e => setFormData({...formData, nom: e.target.value})}
                className="border p-2 rounded"
                required
              />
              <input 
                placeholder="Prénom" 
                value={formData.prenom} 
                onChange={e => setFormData({...formData, prenom: e.target.value})}
                className="border p-2 rounded"
                required
              />
              <input 
                placeholder="Téléphone" 
                value={formData.telephone} 
                onChange={e => setFormData({...formData, telephone: e.target.value})}
                className="border p-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Matières enseignées</label>
              <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto border p-2 rounded">
                {matieres.map(m => (
                  <label key={m.id} className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      checked={formData.matieres.includes(m.id)}
                      onChange={() => toggleSelection(formData.matieres, m.id, (newList) => setFormData({...formData, matieres: newList}))}
                    />
                    <span className="text-sm">{m.nom}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Classes assignées</label>
              <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto border p-2 rounded">
                {classes.map(c => (
                  <label key={c.id} className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      checked={formData.classes.includes(c.id)}
                      onChange={() => toggleSelection(formData.classes, c.id, (newList) => setFormData({...formData, classes: newList}))}
                    />
                    <span className="text-sm">{c.nom}</span>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
              Enregistrer
            </button>
          </form>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {professeurs.map(prof => (
          <div key={prof.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{prof.nom} {prof.prenom}</h3>
                <p className="text-sm text-gray-500">{prof.email}</p>
                {prof.telephone && <p className="text-sm text-gray-500">{prof.telephone}</p>}
              </div>
              <button onClick={() => handleDelete(prof.id)} className="text-red-600 hover:underline text-sm">
                Supprimer
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-xs font-medium text-gray-500">Matières:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {prof.matieres?.map(m => (
                    <span key={m.id} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                      {m.nom}
                    </span>
                  ))}
                  {(!prof.matieres || prof.matieres.length === 0) && (
                    <span className="text-gray-400 text-xs">Aucune</span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500">Classes:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {prof.classes?.map(c => (
                    <span key={c.id} className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                      {c.nom}
                    </span>
                  ))}
                  {(!prof.classes || prof.classes.length === 0) && (
                    <span className="text-gray-400 text-xs">Aucune</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}