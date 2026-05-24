import { useState, useEffect } from 'react';
import api from '../api/axios';

// Matières fixes par classe (ne pas modifier)
const MATIERES_PAR_CLASSE = {
  'DWFS-1': [
    'Communication professionnelle', 'Développement d\'applications web', 'EEJE',
    'Anglais', 'Arabe', 'Français', 'Mathématiques', 'Base de données', 'SRI'
  ],
  'DWFS-2': [
    'Communication professionnelle', 'Développement d\'applications web',
    'Anglais', 'Arabe', 'Français', 'Mathématiques', 'Base de données',
    'PFE', 'Rapport de stage', 'SRI'
  ],
  'PME-1': [
    'Arabe', 'Français', 'Anglais', 'Espagnol', 'Étude de cas',
    'Informatique de gestion', 'Mathématiques', 'Gestion comptable', 'Gestion commerciale', 'APA'
  ],
  'PME-2': [
    'Arabe', 'Français', 'Anglais', 'Espagnol', 'Étude de cas',
    'Informatique de gestion', 'Gestion comptable', 'Gestion commerciale', 'APA', 'Stage'
  ],
};

const SPECIAL_MATIERES = ['PFE', 'Rapport de stage', 'Stage', 'APA'];

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [professeurs, setProfesseurs] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [niveaux, setNiveaux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // UI state
  const [selectedClasse, setSelectedClasse] = useState(null);
  const [etudiants, setEtudiants] = useState([]);
  const [loadingEtudiants, setLoadingEtudiants] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [showImport, setShowImport] = useState(false);

  // Assign state
  const [assignClasseId, setAssignClasseId] = useState('');
  const [assignProfessorId, setAssignProfessorId] = useState('');
  const [assignMatiereId, setAssignMatiereId] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Import state
  const [importFile, setImportFile] = useState(null);
  const [importClasseId, setImportClasseId] = useState('');
  const [importing, setImporting] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [classesRes, profsRes, matieresRes, filieresRes, niveauxRes] = await Promise.allSettled([
        api.get('/classes'),
        api.get('/professeurs'),
        api.get('/matieres'),
        api.get('/filieres'),
        api.get('/niveaux'),
      ]);
      if (classesRes.status === 'fulfilled') setClasses(classesRes.value.data || []);
      if (profsRes.status === 'fulfilled') setProfesseurs(profsRes.value.data || []);
      if (matieresRes.status === 'fulfilled') setMatieres(matieresRes.value.data || []);
      if (filieresRes.status === 'fulfilled') setFilieres(filieresRes.value.data || []);
      if (niveauxRes.status === 'fulfilled') setNiveaux(niveauxRes.value.data || []);
    } catch (err) {
      notify('Erreur chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  const notify = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const selectClasse = async (classeId) => {
    if (selectedClasse === classeId) {
      setSelectedClasse(null);
      setEtudiants([]);
      return;
    }
    setSelectedClasse(classeId);
    setLoadingEtudiants(true);
    try {
      const res = await api.get(`/classes/${classeId}/etudiants`);
      setEtudiants(res.data || []);
    } catch {
      setEtudiants([]);
    } finally {
      setLoadingEtudiants(false);
    }
  };

  // Get matieres for a specific classe based on filiere+niveau
  const getMatieresForClasse = (classe) => {
    const filiereCode = classe.filiere?.code || '';
    const niveauOrdre = classe.niveau?.ordre || 1;
    const key = `${filiereCode}-${niveauOrdre}`;
    return MATIERES_PAR_CLASSE[key] || classe.matieres?.map(m => m.nom) || [];
  };

  // Get filtered matieres for assign dropdown (filter by classe's filiere)
  const getMatieresForAssign = () => {
    if (!assignClasseId) return matieres;
    const classe = classes.find(c => c.id === parseInt(assignClasseId));
    if (!classe) return matieres;
    // Filter matieres that belong to this class (via classe_matiere pivot)
    const classMatiereIds = (classe.matieres || []).map(m => m.id);
    if (classMatiereIds.length > 0) {
      return matieres.filter(m => classMatiereIds.includes(m.id));
    }
    return matieres;
  };

  // Get matieres for professor (from their assigned matieres)
  const getMatieresForProfesseur = () => {
    if (!assignProfessorId) return getMatieresForAssign();
    const prof = professeurs.find(p => p.id === parseInt(assignProfessorId));
    if (prof && prof.matieres && prof.matieres.length > 0) {
      return prof.matieres;
    }
    return getMatieresForAssign();
  };

  const handleAssign = async () => {
    const classeId = assignClasseId || selectedClasse;
    if (!classeId || !assignProfessorId || !assignMatiereId) {
      notify('Sélectionnez classe, professeur et matière', 'error');
      return;
    }
    setAssigning(true);
    try {
      await api.post('/classes/assign-professor-matiere', {
        classe_id: classeId,
        professor_id: assignProfessorId,
        matiere_id: assignMatiereId,
      });
      notify('Assignation réussie!');
      setShowAssign(false);
      setAssignProfessorId('');
      setAssignMatiereId('');
      setAssignClasseId('');
      fetchData();
    } catch (err) {
      notify(err.response?.data?.message || 'Erreur assignation', 'error');
    } finally {
      setAssigning(false);
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!importFile || !importClasseId) {
      notify('Sélectionnez un fichier et une classe', 'error');
      return;
    }
    // Check 30 student limit
    const classe = classes.find(c => c.id === parseInt(importClasseId));
    if (classe && (classe.etudiants?.length || 0) >= 30) {
      notify(`La classe ${classe.nom} a déjà 30 étudiants (maximum atteint)`, 'error');
      return;
    }
    setImporting(true);
    const formData = new FormData();
    formData.append('file', importFile);
    formData.append('classe_id', importClasseId);
    try {
      const res = await api.post('/etudiants/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      notify(`Import réussi: ${res.data.imported || 0} étudiant(s)`);
      setShowImport(false);
      setImportFile(null);
      setImportClasseId('');
      fetchData();
    } catch (err) {
      notify(err.response?.data?.message || 'Erreur import', 'error');
    } finally {
      setImporting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
    </div>
  );

  const classeSelectionnee = classes.find(c => c.id === selectedClasse);

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg text-white font-medium transition-all ${notification.type === 'error' ? 'bg-red-500' : 'bg-green-600'}`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des Classes</h1>
          <p className="text-gray-500 mt-1">4 classes fixes · max 30 étudiants par classe</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setAssignClasseId(''); setShowAssign(true); }}
            className="bg-green-600 text-white px-5 py-2.5 rounded-xl hover:bg-green-700 font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Assigner Prof/Matière
          </button>
          <button
            onClick={() => setShowImport(true)}
            className="bg-white text-gray-700 px-5 py-2.5 rounded-xl hover:bg-gray-50 font-medium transition-colors border border-gray-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Importer Étudiants
          </button>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {classes.map(cl => {
          const matieresClasse = getMatieresForClasse(cl);
          const nbEtudiants = cl.etudiants?.length || 0;
          const isSelected = selectedClasse === cl.id;
          const isFull = nbEtudiants >= 30;

          // Get assignments from the data
          const assignments = cl.classProfesseurMatieres || cl.assignments || [];

          return (
            <div
              key={cl.id}
              className={`bg-white rounded-xl border-2 overflow-hidden cursor-pointer transition-all hover:shadow-md ${isSelected ? 'border-green-500 shadow-md' : 'border-gray-100 shadow-sm'}`}
              onClick={() => selectClasse(cl.id)}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{cl.nom}</h3>
                      <p className="text-sm text-gray-400">{cl.code}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${isFull ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {nbEtudiants} / 30 étudiants
                  </span>
                </div>

                {/* Filiere & Niveau */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400">Filière</p>
                    <p className="text-sm font-medium text-gray-700">{cl.filiere?.nom || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400">Niveau</p>
                    <p className="text-sm font-medium text-gray-700">{cl.niveau?.nom || 'N/A'}</p>
                  </div>
                </div>

                {/* Matieres */}
                {matieresClasse.length > 0 && (
                  <div className="border-t border-gray-100 pt-3 mb-3">
                    <p className="text-xs text-gray-400 mb-2">Matières ({matieresClasse.length})</p>
                    <div className="flex flex-wrap gap-1.5">
                      {matieresClasse.slice(0, 5).map((nom, i) => (
                        <span
                          key={i}
                          className={`text-xs px-2.5 py-1 rounded-lg font-medium ${SPECIAL_MATIERES.includes(nom) ? 'bg-orange-100 text-orange-700' : 'bg-green-50 text-green-700'}`}
                        >
                          {nom}
                        </span>
                      ))}
                      {matieresClasse.length > 5 && (
                        <span className="bg-gray-100 text-gray-500 text-xs px-2.5 py-1 rounded-lg">
                          +{matieresClasse.length - 5} autres
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Prof/Matiere assignments */}
                {assignments.length > 0 && (
                  <div className="border-t border-gray-100 pt-3 mb-3">
                    <p className="text-xs text-gray-400 mb-2">Professeurs assignés</p>
                    <div className="space-y-1">
                      {assignments.slice(0, 3).map((a, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span className="text-green-600 font-medium">{a.professeur?.nom} {a.professeur?.prenom}</span>
                          <span className="text-gray-400">→</span>
                          <span className="text-purple-600">{a.matiere?.nom}</span>
                        </div>
                      ))}
                      {assignments.length > 3 && (
                        <p className="text-xs text-gray-400">+{assignments.length - 3} autres assignations</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Assign button */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setAssignClasseId(String(cl.id));
                      setSelectedClasse(cl.id);
                      setShowAssign(true);
                    }}
                    className="text-green-600 text-sm font-medium hover:text-green-700 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Assigner professeur/matière
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Students list when class selected */}
      {selectedClasse && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Étudiants — {classeSelectionnee?.nom}
              </h2>
              <p className="text-sm text-gray-500">
                {loadingEtudiants ? 'Chargement...' : `${etudiants.length} étudiant(s) · max 30`}
              </p>
            </div>
            <button
              onClick={() => { setImportClasseId(String(selectedClasse)); setShowImport(true); }}
              className="text-sm text-green-600 hover:text-green-700 font-medium border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-50"
            >
              + Importer étudiants
            </button>
          </div>
          {loadingEtudiants ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : etudiants.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-2xl mb-2">👥</p>
              <p>Aucun étudiant dans cette classe</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-gray-500">#</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-500">CNE</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-500">Nom</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-500">Prénom</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-500">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {etudiants.map((et, i) => (
                  <tr key={et.id} className="hover:bg-gray-50">
                    <td className="p-4 text-sm text-gray-400">{i + 1}</td>
                    <td className="p-4 font-mono text-sm text-gray-600">{et.cne}</td>
                    <td className="p-4 font-medium text-gray-800">{et.nom}</td>
                    <td className="p-4 text-gray-600">{et.prenom}</td>
                    <td className="p-4 text-gray-400 text-sm">{et.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ASSIGN MODAL */}
      {showAssign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-1">Assigner Professeur / Matière</h2>
            <p className="text-sm text-gray-500 mb-5">Lier un professeur à une matière pour une classe</p>

            <div className="space-y-4">
              {/* Classe selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Classe *</label>
                <select
                  value={assignClasseId}
                  onChange={e => { setAssignClasseId(e.target.value); setAssignMatiereId(''); }}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                >
                  <option value="">Sélectionner une classe...</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.nom}</option>
                  ))}
                </select>
              </div>

              {/* Professeur selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Professeur *</label>
                <select
                  value={assignProfessorId}
                  onChange={e => { setAssignProfessorId(e.target.value); setAssignMatiereId(''); }}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                >
                  <option value="">Sélectionner un professeur...</option>
                  {professeurs.map(p => (
                    <option key={p.id} value={p.id}>{p.nom} {p.prenom}</option>
                  ))}
                </select>
                {professeurs.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">⚠️ Aucun professeur trouvé. Ajoutez d'abord des professeurs.</p>
                )}
              </div>

              {/* Matiere selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Matière *</label>
                <select
                  value={assignMatiereId}
                  onChange={e => setAssignMatiereId(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                >
                  <option value="">Sélectionner une matière...</option>
                  {getMatieresForProfesseur().map(m => (
                    <option key={m.id} value={m.id}>
                      {m.nom} {SPECIAL_MATIERES.includes(m.nom) ? '⭐' : ''}
                    </option>
                  ))}
                </select>
                {matieres.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">⚠️ Aucune matière trouvée.</p>
                )}
                {SPECIAL_MATIERES.includes(matieres.find(m => m.id === parseInt(assignMatiereId))?.nom) && (
                  <p className="text-xs text-orange-500 mt-1">⭐ Matière spéciale (PFE/Stage) — traitement séparé</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowAssign(false); setAssignProfessorId(''); setAssignMatiereId(''); setAssignClasseId(''); }}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleAssign}
                disabled={assigning || !assignProfessorId || !assignMatiereId}
                className="flex-1 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {assigning ? 'Assignation...' : 'Assigner'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMPORT MODAL */}
      {showImport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-1">Importer des Étudiants</h2>
            <p className="text-sm text-gray-500 mb-5">Fichier Excel/CSV · Max 30 étudiants par classe</p>

            <form onSubmit={handleImport} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Classe *</label>
                <select
                  value={importClasseId}
                  onChange={e => setImportClasseId(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-green-500 outline-none"
                  required
                >
                  <option value="">Sélectionner une classe...</option>
                  {classes.map(c => {
                    const nb = c.etudiants?.length || 0;
                    const full = nb >= 30;
                    return (
                      <option key={c.id} value={c.id} disabled={full}>
                        {c.nom} ({nb}/30){full ? ' — COMPLET' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fichier Excel/CSV *</label>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={e => setImportFile(e.target.files[0])}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-green-500 outline-none text-sm"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">Format: CNE, Nom, Prénom, Email, Date de naissance</p>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => { setShowImport(false); setImportFile(null); setImportClasseId(''); }}
                  className="flex-1 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={importing}
                  className="flex-1 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium disabled:opacity-50"
                >
                  {importing ? 'Import en cours...' : 'Importer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
