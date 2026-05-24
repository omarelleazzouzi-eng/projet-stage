import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function EmploiDuTemps() {
  const [emploiTemps, setEmploiTemps] = useState([]);
  const [classes, setClasses] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [professeurs, setProfesseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedClasse, setSelectedClasse] = useState('');
  const [formData, setFormData] = useState({
    classe_id: '',
    matiere_id: '',
    professeur_id: '',
    jour: 'lundi',
    heure_debut: '08:00',
    heure_fin: '10:00',
    salle: ''
  });

  const jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [empRes, classesRes, matieresRes, profsRes] = await Promise.all([
        api.get('/emploi-temp'),
        api.get('/classes'),
        api.get('/matieres'),
        api.get('/professeurs')
      ]);
      setEmploiTemps(empRes.data.data || empRes.data);
      setClasses(classesRes.data);
      setMatieres(matieresRes.data);
      setProfesseurs(profsRes.data);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/emploi-temp', formData);
      setShowForm(false);
      setFormData({
        classe_id: '',
        matiere_id: '',
        professeur_id: '',
        jour: 'lundi',
        heure_debut: '08:00',
        heure_fin: '10:00',
        salle: ''
      });
      fetchData();
    } catch (err) {
      alert('Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Voulez-vous supprimer cet créneau?')) {
      await api.delete(`/emploi-temp/${id}`);
      fetchData();
    }
  };

  const filteredEmploi = selectedClasse 
    ? emploiTemps.filter(e => e.classe_id == selectedClasse)
    : emploiTemps;

  // Group by day
  const emploiParJour = {};
  jours.forEach(j => emploiParJour[j] = []);
  filteredEmploi.forEach(e => {
    if (emploiParJour[e.jour]) {
      emploiParJour[e.jour].push(e);
    }
  });

  // Sort by hour
  Object.keys(emploiParJour).forEach(jour => {
    emploiParJour[jour].sort((a, b) => a.heure_debut.localeCompare(b.heure_debut));
  });

  const formatJour = (jour) => {
    return jour.charAt(0).toUpperCase() + jour.slice(1);
  };

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Emploi du temps</h1>
          <p className="text-gray-500">Gestion des horaires de cours</p>
        </div>
        <div className="flex gap-4">
          <select 
            value={selectedClasse} 
            onChange={(e) => setSelectedClasse(e.target.value)}
            className="border rounded-lg px-4 py-2"
          >
            <option value="">Toutes les classes</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {showForm ? 'Annuler' : 'Ajouter un créneau'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Ajouter un créneau horaire</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <select 
              value={formData.classe_id} 
              onChange={(e) => setFormData({...formData, classe_id: e.target.value})}
              className="border p-2 rounded"
              required
            >
              <option value="">Sélectionner classe</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.nom}</option>
              ))}
            </select>
            <select 
              value={formData.matiere_id} 
              onChange={(e) => setFormData({...formData, matiere_id: e.target.value})}
              className="border p-2 rounded"
              required
            >
              <option value="">Sélectionner matière</option>
              {matieres.map(m => (
                <option key={m.id} value={m.id}>{m.nom}</option>
              ))}
            </select>
            <select 
              value={formData.professeur_id} 
              onChange={(e) => setFormData({...formData, professeur_id: e.target.value})}
              className="border p-2 rounded"
              required
            >
              <option value="">Sélectionner professeur</option>
              {professeurs.map(p => (
                <option key={p.id} value={p.id}>{p.nom} {p.prenom}</option>
              ))}
            </select>
            <select 
              value={formData.jour} 
              onChange={(e) => setFormData({...formData, jour: e.target.value})}
              className="border p-2 rounded"
            >
              {jours.map(j => (
                <option key={j} value={j}>{formatJour(j)}</option>
              ))}
            </select>
            <input 
              type="time" 
              value={formData.heure_debut} 
              onChange={(e) => setFormData({...formData, heure_debut: e.target.value})}
              className="border p-2 rounded"
              required
            />
            <input 
              type="time" 
              value={formData.heure_fin} 
              onChange={(e) => setFormData({...formData, heure_fin: e.target.value})}
              className="border p-2 rounded"
              required
            />
            <input 
              type="text" 
              placeholder="Salle (optionnel)"
              value={formData.salle} 
              onChange={(e) => setFormData({...formData, salle: e.target.value})}
              className="border p-2 rounded"
            />
            <button type="submit" className="bg-green-600 text-white p-2 rounded col-span-2 md:col-span-3">
              Enregistrer
            </button>
          </form>
        </div>
      )}

      {/* Schedule by day */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jours.map(jour => (
          <div key={jour} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3">
              <h3 className="font-semibold text-center">{formatJour(jour)}</h3>
            </div>
            <div className="p-3">
              {emploiParJour[jour].length === 0 ? (
                <p className="text-gray-400 text-center py-4">Aucun cours</p>
              ) : (
                <div className="space-y-2">
                  {emploiParJour[jour].map(creneau => (
                    <div key={creneau.id} className="border rounded p-2 text-sm">
                      <div className="flex justify-between font-medium">
                        <span className="text-blue-600">{creneau.heure_debut} - {creneau.heure_fin}</span>
                        {creneau.salle && <span className="text-gray-500">Salle {creneau.salle}</span>}
                      </div>
                      <div className="mt-1">{creneau.matiere?.nom}</div>
                      <div className="text-gray-500 text-xs">
                        {creneau.professeur?.nom} {creneau.professeur?.prenom}
                      </div>
                      <button 
                        onClick={() => handleDelete(creneau.id)}
                        className="text-red-500 text-xs hover:underline mt-1"
                      >
                        Supprimer
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}