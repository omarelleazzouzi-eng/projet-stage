import { useState, useEffect, useContext } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [mensuelles, setMensuelles] = useState([]);
  const [avertissements, setAvertissements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dashboardRes, mensuellesRes, avertRes] = await Promise.all([
          api.get('/statistiques/dashboard'),
          api.get('/statistiques/mensuelles'),
          api.get('/avertissements/etudiants-avertir')
        ]);
        setStats(dashboardRes.data);
        setMensuelles(mensuellesRes.data);
        setAvertissements(avertRes.data.etudiants || []);
      } catch (err) {
        console.error('Erreur dashboard:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-secondary-500">Chargement du dashboard...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="p-6 bg-red-50 rounded-xl border border-red-200">
      <p className="text-red-600">Erreur: {error}</p>
      <button onClick={() => window.location.reload()} className="mt-2 text-primary-600 hover:text-primary-700 font-medium">
        Recharger la page
      </button>
    </div>
  );

  if (!stats) return <div className="p-8 text-secondary-500">Aucune donnée disponible</div>;

  const barData = {
    labels: mensuelles.map((m) => m.nom),
    datasets: [
      { 
        label: 'Absences', 
        data: mensuelles.map((m) => m.absents), 
        backgroundColor: '#ef4444',
        borderRadius: 6,
      },
      { 
        label: 'Retards', 
        data: mensuelles.map((m) => m.retards), 
        backgroundColor: '#f59e0b',
        borderRadius: 6,
      },
    ],
  };

  const pieData = {
    labels: ['Présents', 'Absents', 'Retards'],
    datasets: [
      {
        data: [
          stats.par_statut?.presents || 0,
          stats.par_statut?.absents || 0,
          stats.par_statut?.retards || 0,
        ],
        backgroundColor: ['#22c55e', '#ef4444', '#f59e0b'],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
      x: { grid: { display: false } }
    }
  };

  const statsCards = [
    { label: 'Total Étudiants', value: stats.total_etudiants || 0, color: 'primary', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { label: 'Absences aujourd\'hui', value: stats.absences_aujourdhui || 0, color: 'red', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Absences ce mois', value: stats.absences_mois || 0, color: 'orange', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { label: 'Classes actives', value: stats.total_classes || 0, color: 'green', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  ];

  const colorMap = {
    primary: 'bg-primary-50 text-primary-700',
    red: 'bg-red-50 text-red-700',
    orange: 'bg-orange-50 text-orange-700',
    green: 'bg-green-50 text-green-700',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-secondary-800">Bienvenue, {user?.name || 'Utilisateur'}</h1>
        <p className="text-secondary-500 mt-1">
          Voici un aperçu de votre établissement aujourd'hui
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-card hover:shadow-card-hover transition-shadow border border-secondary-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-500 text-sm font-medium">{card.label}</p>
                <p className={`text-3xl font-bold mt-2 ${colorMap[card.color]}`}>{card.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${colorMap[card.color]} flex items-center justify-center`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-card border border-secondary-100 p-6">
          <h2 className="text-lg font-semibold text-secondary-800 mb-4">Absences mensuelles</h2>
          <Bar data={barData} options={chartOptions} />
        </div>
        <div className="bg-white rounded-xl shadow-card border border-secondary-100 p-6">
          <h2 className="text-lg font-semibold text-secondary-800 mb-4">Répartition du mois</h2>
          <div className="h-64 flex items-center justify-center">
            <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Avertissements Section */}
      {avertissements.length > 0 && (
        <div className="bg-white rounded-xl shadow-card border border-red-200 overflow-hidden mb-8">
          <div className="px-6 py-4 bg-red-50 border-b border-red-100">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 className="text-lg font-semibold text-red-800">
                Étudiants à avertir ({avertissements.length})
              </h2>
            </div>
            <p className="text-red-600 text-sm mt-1">Étudiants ayant dépassé le seuil de 10 heures d'absence</p>
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
                {avertissements.map((et) => (
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
                      <div className="flex gap-2 justify-center">
                        <a
                          href={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/rapports/avertissement/${et.id}`}
                          target="_blank"
                          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                        >
                          Avertissement
                        </a>
                        <a
                          href={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/rapports/engagement/${et.id}`}
                          target="_blank"
                          className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                        >
                          Engagement
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {avertissements.length === 0 && (
        <div className="bg-white rounded-xl shadow-card border border-secondary-100 p-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-secondary-800">Aucun étudiant n'a dépassé le seuil de 10 heures</p>
              <p className="text-secondary-500 text-sm">Tout est en ordre pour le moment</p>
            </div>
          </div>
        </div>
      )}

      {/* Top Absents */}
      <div className="bg-white rounded-xl shadow-card border border-secondary-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-secondary-100">
          <h2 className="text-lg font-semibold text-secondary-800">Étudiants les plus absents</h2>
        </div>
        {stats.top_absents && stats.top_absents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary-50">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-secondary-600">#</th>
                  <th className="p-4 text-left text-sm font-semibold text-secondary-600">Étudiant</th>
                  <th className="p-4 text-left text-sm font-semibold text-secondary-600">Classe</th>
                  <th className="p-4 text-center text-sm font-semibold text-secondary-600">Absences</th>
                  <th className="p-4 text-center text-sm font-semibold text-secondary-600">Retards</th>
                </tr>
              </thead>
              <tbody>
                {stats.top_absents.map((et, index) => (
                  <tr key={et.id} className="border-b border-secondary-100 hover:bg-secondary-50">
                    <td className="p-4 text-secondary-500">{index + 1}</td>
                    <td className="p-4 font-medium text-secondary-800">{et.nom} {et.prenom}</td>
                    <td className="p-4 text-secondary-600">{et.classe?.nom || 'N/A'}</td>
                    <td className="p-4 text-center">
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                        {et.total_absences || 0}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                        {et.total_retards || 0}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-secondary-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-secondary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>Aucune absence enregistrée</p>
          </div>
        )}
      </div>
    </div>
  );
}