import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function Rapports() {
  const [etudiants, setEtudiants] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedEtudiant, setSelectedEtudiant] = useState('');
  const [selectedClasse, setSelectedClasse] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [avertissements, setAvertissements] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/etudiants'),
      api.get('/classes'),
      api.get('/avertissements/etudiants-avertir')
    ]).then(([resEtud, resClasses, resAvert]) => {
      setEtudiants(resEtud.data.data || resEtud.data);
      setClasses(resClasses.data);
      setAvertissements(resAvert.data.etudiants || []);
    }).catch(err => {
      console.error('Erreur chargement:', err);
    });
  }, []);

  const generatePDF = async (type) => {
    if (!selectedEtudiant) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner un étudiant' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const endpoint = type === 'avertissement' 
        ? `/rapports/avertissement/${selectedEtudiant}`
        : `/rapports/engagement/${selectedEtudiant}`;
      
      const res = await api.get(endpoint, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      const etudiant = etudiants.find(e => e.id === parseInt(selectedEtudiant));
      const filename = etudiant 
        ? `${type}-${etudiant.nom}-${etudiant.prenom}.pdf` 
        : `${type}-${selectedEtudiant}.pdf`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setMessage({ type: 'success', text: 'PDF généré avec succès!' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Erreur lors de la génération du PDF' });
    }
    setLoading(false);
  };

  const generateRapportClasse = async () => {
    if (!selectedClasse) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner une classe' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await api.get(`/rapports/classe/${selectedClasse}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      const classe = classes.find(c => c.id === parseInt(selectedClasse));
      const filename = classe 
        ? `rapport-${classe.code}.pdf` 
        : `rapport-classe-${selectedClasse}.pdf`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setMessage({ type: 'success', text: 'Rapport généré avec succès!' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Erreur lors de la génération' });
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-secondary-800">Génération des Rapports</h1>
        <p className="text-secondary-500 mt-1">Générez des rapports PDF pour les étudiants et les classes</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${
          message.type === 'error' 
            ? 'bg-red-50 border border-red-200 text-red-700' 
            : 'bg-primary-50 border border-primary-200 text-primary-700'
        }`}>
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {message.type === 'error' ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            )}
          </svg>
          {message.text}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Rapport par étudiant */}
        <div className="bg-white rounded-xl shadow-card border border-secondary-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-secondary-800">Rapport par étudiant</h2>
              <p className="text-sm text-secondary-500">Avertissement ou engagement</p>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-secondary-700 mb-2">Sélectionner un étudiant</label>
            <select
              value={selectedEtudiant}
              onChange={(e) => setSelectedEtudiant(e.target.value)}
              className="w-full border border-secondary-200 rounded-xl p-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Choisir un étudiant...</option>
              {etudiants.map(e => (
                <option key={e.id} value={e.id}>{e.nom} {e.prenom} - {e.cne}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => generatePDF('avertissement')}
              disabled={loading}
              className="bg-red-600 text-white p-3 rounded-xl hover:bg-red-700 disabled:opacity-50 font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Avertissement
            </button>
            <button
              onClick={() => generatePDF('engagement')}
              disabled={loading}
              className="bg-primary-600 text-white p-3 rounded-xl hover:bg-primary-700 disabled:opacity-50 font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Engagement
            </button>
          </div>
        </div>

        {/* Rapport par classe */}
        <div className="bg-white rounded-xl shadow-card border border-secondary-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-secondary-800">Rapport par classe</h2>
              <p className="text-sm text-secondary-500">Absences globales d'une classe</p>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-secondary-700 mb-2">Sélectionner une classe</label>
            <select
              value={selectedClasse}
              onChange={(e) => setSelectedClasse(e.target.value)}
              className="w-full border border-secondary-200 rounded-xl p-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Choisir une classe...</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.nom} ({c.filiere?.nom})</option>
              ))}
            </select>
          </div>

          <button
            onClick={generateRapportClasse}
            disabled={loading}
            className="w-full bg-primary-600 text-white p-3 rounded-xl hover:bg-primary-700 disabled:opacity-50 font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Générer le rapport
          </button>
        </div>
      </div>

      {/* Étudiants avec plus de 10h d'absence */}
      {avertissements.length > 0 && (
        <div className="bg-white rounded-xl shadow-card border border-red-200 overflow-hidden">
          <div className="px-6 py-4 bg-red-50 border-b border-red-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-red-800">
                  Étudiants à avertir ({avertissements.length})
                </h2>
                <p className="text-red-600 text-sm">Étudiants ayant dépassé le seuil de 10 heures d'absence</p>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary-50">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-secondary-600">CNE</th>
                  <th className="p-4 text-left text-sm font-semibold text-secondary-600">Nom et Prénom</th>
                  <th className="p-4 text-left text-sm font-semibold text-secondary-600">Classe</th>
                  <th className="p-4 text-center text-sm font-semibold text-secondary-600">Heures</th>
                  <th className="p-4 text-center text-sm font-semibold text-secondary-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {avertissements.map(et => (
                  <tr key={et.id} className="border-b border-secondary-100 hover:bg-secondary-50">
                    <td className="p-4 font-mono text-sm text-secondary-600">{et.cne}</td>
                    <td className="p-4 font-medium text-secondary-800">{et.nom} {et.prenom}</td>
                    <td className="p-4 text-secondary-600">{et.classe}</td>
                    <td className="p-4 text-center">
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-semibold text-sm">
                        {et.total_heures}h
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => { setSelectedEtudiant(et.id.toString()); generatePDF('avertissement'); }}
                        disabled={loading}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        Générer Avertissement
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 bg-primary-50 border border-primary-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-primary-800 mb-2">Instructions</h3>
            <ul className="list-disc list-inside text-sm text-primary-700 space-y-1">
              <li>Sélectionnez un étudiant pour générer un avertissement ou une lettre d'engagement</li>
              <li>Sélectionnez une classe pour générer un rapport global des absences</li>
              <li>Les PDF sont automatiquement téléchargés après génération</li>
              <li>Les étudiants avec plus de 10h d'absence apparaissent dans la section "Étudiants à avertir"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}