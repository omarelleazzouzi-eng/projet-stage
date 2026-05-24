import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function ImporterEtudiants() {
  const [file, setFile] = useState(null);
  const [classeId, setClasseId] = useState('');
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/classes').then(res => setClasses(res.data));
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'];
      if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(xlsx|xls|csv)$/)) {
        setError('Veuillez sélectionner un fichier Excel ou CSV');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Veuillez sélectionner un fichier');
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    if (classeId) {
      formData.append('classe_id', classeId);
    }

    try {
      const res = await api.post('/etudiants/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'importation');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = `cne,nom,prenom,email,date_naissance,lieu_naissance,telephone,classe,filiere,niveau
P123456,Dupont,Jean,jean.dupont@email.com,2005-05-15,Casablanca,0600000000,DWFS 1ère année,DWFS,1A
P234567,Martin,Luc,luc.martin@email.com,2005-03-20,Rabat,0600000001,DWFS 1ère année,DWFS,1A`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modele_import_etudiants.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Importer des étudiants</h1>

      {/* Instructions */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <h3 className="font-semibold text-blue-800 mb-2">Instructions d'importation</h3>
        <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
          <li>Le fichier doit être au format Excel (.xlsx, .xls) ou CSV</li>
          <li>Colonnes obligatoires: CNE, nom, prénom</li>
          <li>Colonnes optionnelles: email, date_naissance, lieu_naissance, telephone</li>
          <li>Pour créer automatiquement les classes: colonnes classe, filiere, niveau</li>
          <li>Codes filières: DWFS, PME | Codes niveaux: 1A, 2A</li>
        </ul>
        <button
          onClick={downloadTemplate}
          className="mt-3 text-blue-600 underline text-sm"
        >
          Télécharger le modèle
        </button>
      </div>

      {/* Import Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Fichier Excel/CSV</label>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="w-full border rounded p-2"
            />
            {file && (
              <p className="text-sm text-green-600 mt-1">Fichier sélectionné: {file.name}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              Classe destination <span className="text-gray-500">(optionnel si classes dans fichier)</span>
            </label>
            <select
              value={classeId}
              onChange={(e) => setClasseId(e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="">Sélectionner une classe</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.nom} ({c.filiere?.nom})</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !file}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Importation en cours...' : 'Importer'}
          </button>
        </form>
      </div>

      {/* Results */}
      {result && (
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg mb-4">Résultats de l'importation</h3>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-green-100 p-4 rounded text-center">
              <p className="text-2xl font-bold text-green-600">{result.imported}</p>
              <p className="text-sm text-green-700">Étudiants importés</p>
            </div>
            <div className="bg-yellow-100 p-4 rounded text-center">
              <p className="text-2xl font-bold text-yellow-600">{result.created?.length || 0}</p>
              <p className="text-sm text-yellow-700">Enregistrements traités</p>
            </div>
            <div className="bg-red-100 p-4 rounded text-center">
              <p className="text-2xl font-bold text-red-600">{result.errors?.length || 0}</p>
              <p className="text-sm text-red-700">Erreurs</p>
            </div>
          </div>

          {result.created && result.created.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-green-700 mb-2">Étudiants créés/mis à jour:</h4>
              <ul className="text-sm text-gray-600 max-h-32 overflow-y-auto">
                {result.created.slice(0, 10).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
                {result.created.length > 10 && (
                  <li className="text-gray-500">... et {result.created.length - 10} autres</li>
                )}
              </ul>
            </div>
          )}

          {result.errors && result.errors.length > 0 && (
            <div>
              <h4 className="font-medium text-red-700 mb-2">Erreurs:</h4>
              <ul className="text-sm text-red-600 max-h-32 overflow-y-auto">
                {result.errors.slice(0, 10).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
                {result.errors.length > 10 && (
                  <li className="text-gray-500">... et {result.errors.length - 10} autres erreurs</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}