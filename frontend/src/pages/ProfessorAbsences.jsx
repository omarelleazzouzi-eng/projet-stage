import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function ProfessorAbsences() {
  const [classes, setClasses] = useState([]);
  const [selectedClasse, setSelectedClasse] = useState(null);
  const [etudiants, setEtudiants] = useState([]);
  const [seances, setSeances] = useState([]);
  const [selectedSeance, setSelectedSeance] = useState(null);
  const [presences, setPresences] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/professor/classes');
      setClasses(res.data);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectClasse = async (classeId) => {
    setSelectedClasse(classeId);
    setSelectedSeance(null);
    setEtudiants([]);
    setSeances([]);
    
    try {
      const [etudiantsRes, seancesRes] = await Promise.all([
        api.get(`/classes/${classeId}/etudiants`),
        api.get(`/professor/seances?classe_id=${classeId}`)
      ]);
      setEtudiants(etudiantsRes.data);
      setSeances(seancesRes.data.data || seancesRes.data);
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const selectSeance = async (seance) => {
    setSelectedSeance(seance);
    
    try {
      const res = await api.get(`/seances/${seance.id}`);
      const seanceData = res.data;
      
      const initialPresences = {};
      seanceData.classe?.etudiants?.forEach(etudiant => {
        const absence = seanceData.absences?.find(a => a.etudiant_id === etudiant.id);
        initialPresences[etudiant.id] = absence ? absence.statut : 'present';
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
      alert('Présences enregistrées!');
    } catch (err) {
      alert('Erreur: ' + (err.response?.data?.error || err.message));
    }
  };

  const createSeance = async () => {
    const date = prompt('Date (YYYY-MM-DD):');
    if (!date) return;
    
    try {
      const res = await api.post('/seances', {
        classe_id: selectedClasse,
        matiere_id: classes.find(c => c.id === selectedClasse)?.matiere_id || 1,
        date,
        heure_debut: '08:00',
        heure_fin: '10:00'
      });
      setSeances([...seances, res.data]);
      alert('Séance créée!');
    } catch (err) {
      alert('Erreur: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestion des Absences</h1>

      {/* Select Class */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Sélectionner une classe</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {classes.map(classe => (
            <button
              key={classe.id}
              onClick={() => selectClasse(classe.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedClasse === classe.id 
                  ? 'border-blue-600 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="font-medium">{classe.nom}</div>
              <div className="text-sm text-gray-500">{classe.etudiants_count || 0} étudiants</div>
            </button>
          ))}
        </div>
      </div>

      {selectedClasse && (
        <>
          {/* Seances */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Séances</h2>
              <button 
                onClick={createSeance}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                + Nouvelle séance
              </button>
            </div>
            
            {seances.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {seances.map(seance => (
                  <button
                    key={seance.id}
                    onClick={() => selectSeance(seance)}
                    className={`p-3 rounded border text-left ${
                      selectedSeance?.id === seance.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="font-medium">{seance.date}</div>
                    <div className="text-sm text-gray-500">{seance.heure_debut} - {seance.heure_fin}</div>
                    <div className="text-sm text-gray-500">{seance.matiere?.nom}</div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Aucune séance trouvée</p>
            )}
          </div>

          {/* Students List */}
          {selectedSeance && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 bg-blue-50 border-b flex justify-between items-center">
                <div>
                  <span className="font-semibold">Liste des étudiants</span>
                  <span className="text-gray-500 ml-2">
                    {selectedSeance.date} | {selectedSeance.matiere?.nom}
                  </span>
                </div>
                <button 
                  onClick={savePresences}
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                >
                  Enregistrer
                </button>
              </div>
              
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">Étudiant</th>
                    <th className="p-3 text-center">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {etudiants.map(etudiant => (
                    <tr key={etudiant.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-medium">{etudiant.nom} {etudiant.prenom}</div>
                        <div className="text-sm text-gray-500">{etudiant.cne}</div>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => setPresences({...presences, [etudiant.id]: 'present'})}
                            className={`px-4 py-2 rounded ${
                              presences[etudiant.id] === 'present'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-green-50'
                            }`}
                          >
                            ✓ Présent
                          </button>
                          <button
                            onClick={() => setPresences({...presences, [etudiant.id]: 'absent'})}
                            className={`px-4 py-2 rounded ${
                              presences[etudiant.id] === 'absent'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-red-50'
                            }`}
                          >
                            ✗ Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}