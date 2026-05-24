import { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

export default function Absences() {
  const [absences, setAbsences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    date_debut: '',
    date_fin: '',
    classe_id: '',
    matiere_id: '',
    etudiant_id: '',
    statut: '',
    professeur_id: ''
  });
  const [classes, setClasses] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [professeurs, setProfesseurs] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useContext(AuthContext);

  // Charger les données de base
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classesRes, matieresRes] = await Promise.all([
          api.get('/classes'),
          api.get('/matieres')
        ]);
        setClasses(classesRes.data);
        setMatieres(matieresRes.data);
        
        // Si directeur, charger aussi les profs
        if (user?.role === 'directeur') {
          const profsRes = await api.get('/professeurs');
          setProfesseurs(profsRes.data);
        }
      } catch (err) {
        console.error('Erreur chargement données:', err);
      }
    };
    fetchData();
  }, [user?.role]);

  // Charger les absences avec filtres
  const fetchAbsences = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const res = await api.get(`/absences?${params.toString()}`);
      setAbsences(res.data);
    } catch (err) {
      console.error('Erreur chargement absences:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbsences();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    fetchAbsences();
  };

  const resetFilters = () => {
    setFilters({
      date_debut: '',
      date_fin: '',
      classe_id: '',
      matiere_id: '',
      etudiant_id: '',
      statut: '',
      professeur_id: ''
    });
    fetchAbsences();
  };

  const getTypeColor = (statut) => {
    if (statut === 'present') return 'bg-green-100 text-green-800';
    if (statut === 'absent') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getTypeLabel = (statut) => {
    if (statut === 'present') return 'Présent';
    if (statut === 'absent') return 'Absent';
    return 'Retard';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Absences</h1>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
        </button>
      </div>

      {/* Filtres */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="font-semibold mb-3">Filtres de recherche</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Date début</label>
              <input
                type="date"
                name="date_debut"
                value={filters.date_debut}
                onChange={handleFilterChange}
                className="w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Date fin</label>
              <input
                type="date"
                name="date_fin"
                value={filters.date_fin}
                onChange={handleFilterChange}
                className="w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Classe</label>
              <select
                name="classe_id"
                value={filters.classe_id}
                onChange={handleFilterChange}
                className="w-full border rounded p-2"
              >
                <option value="">Toutes les classes</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Matière</label>
              <select
                name="matiere_id"
                value={filters.matiere_id}
                onChange={handleFilterChange}
                className="w-full border rounded p-2"
              >
                <option value="">Toutes les matières</option>
                {matieres.map(m => (
                  <option key={m.id} value={m.id}>{m.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Statut</label>
              <select
                name="statut"
                value={filters.statut}
                onChange={handleFilterChange}
                className="w-full border rounded p-2"
              >
                <option value="">Tous les statuts</option>
                <option value="present">Présent</option>
                <option value="absent">Absent</option>
                <option value="retard">Retard</option>
              </select>
            </div>
            {user?.role === 'directeur' && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">Professeur</label>
                <select
                  name="professeur_id"
                  value={filters.professeur_id}
                  onChange={handleFilterChange}
                  className="w-full border rounded p-2"
                >
                  <option value="">Tous les professeurs</option>
                  {professeurs.map(p => (
                    <option key={p.id} value={p.id}>{p.nom} {p.prenom}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={applyFilters}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Appliquer les filtres
            </button>
            <button
              onClick={resetFilters}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Chargement...</p>
          </div>
        ) : absences.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Étudiant</th>
                <th className="p-3 text-left">Classe</th>
                <th className="p-3 text-left">Matière</th>
                <th className="p-3 text-left">Professeur</th>
                <th className="p-3 text-center">Statut</th>
                <th className="p-3 text-center">Justifiée</th>
              </tr>
            </thead>
            <tbody>
              {absences.map((ab) => (
                <tr key={ab.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    {ab.seance?.date ? new Date(ab.seance.date).toLocaleDateString('fr-FR') : 'N/A'}
                  </td>
                  <td className="p-3">
                    {ab.etudiant?.nom} {ab.etudiant?.prenom}
                  </td>
                  <td className="p-3">{ab.etudiant?.classe?.nom || 'N/A'}</td>
                  <td className="p-3">{ab.seance?.matiere?.nom || 'N/A'}</td>
                  <td className="p-3">
                    {ab.seance?.professor ? `${ab.seance.professor.nom} ${ab.seance.professor.prenom}` : 'N/A'}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded text-sm ${getTypeColor(ab.statut)}`}>
                      {getTypeLabel(ab.statut)}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    {ab.est_justifiee ? (
                      <span className="text-green-600">✓ Oui</span>
                    ) : (
                      <span className="text-red-600">✗ Non</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-gray-500">
            Aucune absence trouvée
          </div>
        )}
        
        {absences.length > 0 && (
          <div className="p-4 bg-gray-50 border-t text-sm text-gray-600">
            Total: {absences.length} enregistrement(s)
          </div>
        )}
      </div>
    </div>
  );
}