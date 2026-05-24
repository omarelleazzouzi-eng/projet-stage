import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function ProfessorAttendance() {
  const [classes, setClasses] = useState([]);
  const [selectedClasse, setSelectedClasse] = useState(null);
  const [matieres, setMatieres] = useState([]);
  const [selectedMatiere, setSelectedMatiere] = useState(null);
  const [etudiants, setEtudiants] = useState([]);
  const [seance, setSeance] = useState(null);
  const [presences, setPresences] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creatingSeance, setCreatingSeance] = useState(false);
  const [notification, setNotification] = useState(null);

  const sessions = [
    { value: '08:00-10:00', label: '08h - 10h' },
    { value: '10:00-12:00', label: '10h - 12h' },
    { value: '14:00-16:00', label: '14h - 16h' },
    { value: '16:00-18:00', label: '16h - 18h' },
  ];

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/professor/classes');
      setClasses(res.data);
    } catch (err) {
      showNotification('Erreur chargement classes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Step 1: Select class
  const selectClasse = async (classeId) => {
    if (selectedClasse === classeId) {
      setSelectedClasse(null);
      setSelectedMatiere(null);
      setMatieres([]);
      setSeance(null);
      setEtudiants([]);
      return;
    }

    setSelectedClasse(classeId);
    setSelectedMatiere(null);
    setSeance(null);

    try {
      // Get matieres for this class for this professor
      const matieresRes = await api.get(`/professor/classes/${classeId}/matieres`);
      setMatieres(matieresRes.data);

      // Get students
      const etudsRes = await api.get(`/classes/${classeId}/etudiants`);
      setEtudiants(etudsRes.data);
    } catch (err) {
      showNotification('Erreur chargement', 'error');
    }
  };

  // Step 2: Select subject - auto-create or get today's session
  const selectMatiere = async (matiereId) => {
    if (selectedMatiere === matiereId) {
      setSelectedMatiere(null);
      setSeance(null);
      return;
    }

    setSelectedMatiere(matiereId);
    setCreatingSeance(true);

    const today = new Date().toISOString().split('T')[0];
    const defaultSession = sessions[0];

    try {
      // Auto-create or get existing séance
      const [heure_debut, heure_fin] = defaultSession.value.split('-');
      
      const res = await api.post('/professor/seance/auto', {
        classe_id: selectedClasse,
        matiere_id: matiereId,
        date: today,
        heure_debut: heure_debut.trim(),
        heure_fin: heure_fin.trim()
      });

      const newSeance = res.data;
      setSeance(newSeance);

      // Initialize presences
      const initialPresences = {};
      etudiants.forEach(etudiant => {
        const absence = newSeance.absences?.find(a => a.etudiant_id === etudiant.id);
        initialPresences[etudiant.id] = absence ? absence.statut : 'present';
      });
      setPresences(initialPresences);

      showNotification('Séance créée pour aujourd\'hui');
    } catch (err) {
      showNotification(err.response?.data?.message || 'Erreur création séance', 'error');
    } finally {
      setCreatingSeance(false);
    }
  };

  // Save presences
  const savePresences = async () => {
    if (!seance) return;

    setSaving(true);
    const absences = Object.entries(presences).map(([etudiantId, statut]) => ({
      etudiant_id: parseInt(etudiantId),
      statut
    }));

    try {
      await api.post(`/seances/${seance.id}/absences`, { absences });
      showNotification('Présences enregistrées!');
    } catch (err) {
      showNotification(err.response?.data?.error || 'Erreur enregistrement', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
          notification.type === 'error' ? 'bg-red-600' : 'bg-green-600'
        } text-white`}>
          {notification.message}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestion des absences</h1>
        <p className="text-gray-500">
          Séance du {new Date().toLocaleDateString('fr-FR')}
        </p>
      </div>

      {/* Step 1: Select Class */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">1. Sélectionner une classe</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {classes.map(classe => (
            <button
              key={classe.id}
              onClick={() => selectClasse(classe.id)}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedClasse === classe.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="font-semibold">{classe.nom}</div>
              <div className="text-sm text-gray-500">{classe.code}</div>
            </button>
          ))}
        </div>
      </div>

      {selectedClasse && (
        <>
          {/* Step 2: Select Subject */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-bold mb-4">
              2. Sélectionner la matière {creatingSeance && '(création séance...)'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {matieres.map(matiere => (
                <button
                  key={matiere.id}
                  onClick={() => selectMatiere(matiere.id)}
                  disabled={creatingSeance}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedMatiere === matiere.id
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  } disabled:opacity-50`}
                >
                  <div className="font-semibold">{matiere.nom}</div>
                  <div className="text-sm text-gray-500">{matiere.code}</div>
                </button>
              ))}
            </div>
            {matieres.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                Aucune matière assignée à cette classe
              </p>
            )}
          </div>

          {/* Step 3: Mark Attendance */}
          {selectedMatiere && seance && etudiants.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 bg-blue-50 border-b flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold">3. Marquer les présences</h2>
                  <p className="text-sm text-gray-500">
                    {seance.date} | {seance.heure_debut} - {seance.heure_fin}
                  </p>
                </div>
                <button
                  onClick={savePresences}
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
                >
                  💾 Enregistrer
                </button>
              </div>

              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">Étudiant</th>
                    <th className="p-3 text-left">CNE</th>
                    <th className="p-3 text-center">Présence</th>
                  </tr>
                </thead>
                <tbody>
                  {etudiants.map(etudiant => (
                    <tr key={etudiant.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">
                        {etudiant.nom} {etudiant.prenom}
                      </td>
                      <td className="p-3 font-mono text-sm text-gray-600">{etudiant.cne}</td>
                      <td className="p-3">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => setPresences({...presences, [etudiant.id]: 'present'})}
                            className={`px-4 py-2 rounded font-medium ${
                              presences[etudiant.id] === 'present'
                                ? 'bg-green-600 text-white'
                                : 'bg-green-50 text-green-600 hover:bg-green-100'
                            }`}
                          >
                            ✓ Présent
                          </button>
                          <button
                            onClick={() => setPresences({...presences, [etudiant.id]: 'absent'})}
                            className={`px-4 py-2 rounded font-medium ${
                              presences[etudiant.id] === 'absent'
                                ? 'bg-red-600 text-white'
                                : 'bg-red-50 text-red-600 hover:bg-red-100'
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

              <div className="p-4 bg-gray-50 flex gap-6 justify-center">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-green-600 rounded"></span>
                  <span>Présents: {Object.values(presences).filter(p => p === 'present').length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-red-600 rounded"></span>
                  <span>Absents: {Object.values(presences).filter(p => p === 'absent').length}</span>
                </div>
              </div>
            </div>
          )}

          {selectedClasse && etudiants.length === 0 && (
            <div className="bg-white rounded-xl shadow p-8 text-center">
              <p className="text-gray-500 text-lg">Aucun étudiant dans cette classe</p>
              <p className="text-gray-400 text-sm mt-2">Demandez au directeur d'importer les étudiants</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}