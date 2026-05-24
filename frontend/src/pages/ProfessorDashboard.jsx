import { useState, useEffect } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import api from '../api/axios';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function ProfessorDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/professor/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  const studentData = {
    labels: stats?.classes?.map(c => c.nom) || [],
    datasets: [{
      label: 'Étudiants',
      data: stats?.classes?.map(c => c.etudiants_count) || [],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)',
      ],
      borderRadius: 8,
    }]
  };

  const absenceData = {
    labels: ['Présences', 'Absences non justifiées', 'Retards'],
    datasets: [{
      data: [
        stats?.seances_count * 10 || 100,
        stats?.absences_30_jours || 5,
        stats?.absences_30_jours / 2 || 2
      ],
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(245, 158, 11, 0.8)',
      ],
      borderWidth: 0,
    }]
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Professor</h1>
        <p className="text-gray-500">Vue d'ensemble de vos classes et statistiques</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm">Classes assignées</p>
              <p className="text-4xl font-bold mt-2">{stats?.total_classes || 0}</p>
            </div>
            <div className="text-4xl">🏫</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm">Total étudiants</p>
              <p className="text-4xl font-bold mt-2">{stats?.total_etudiants || 0}</p>
            </div>
            <div className="text-4xl">👨‍🎓</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm">Séances effectuées</p>
              <p className="text-4xl font-bold mt-2">{stats?.seances_count || 0}</p>
            </div>
            <div className="text-4xl">📚</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-200 text-sm">Absences (30j)</p>
              <p className="text-4xl font-bold mt-2">{stats?.absences_30_jours || 0}</p>
            </div>
            <div className="text-4xl">❌</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Étudiants par classe</h2>
          <div className="h-64">
            {stats?.classes?.length > 0 ? (
              <Bar 
                data={studentData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { stepSize: 1 }
                    }
                  }
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Aucune classe assignée
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Répartition des présences</h2>
          <div className="h-64 flex items-center justify-center">
            <Doughnut 
              data={absenceData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Upcoming Seances */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">📅 Prochaines séances</h2>
        {stats?.seances_a_venir?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600">Date</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600">Classe</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600">Matière</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600">Horaire</th>
                </tr>
              </thead>
              <tbody>
                {stats.seances_a_venir.map(seance => (
                  <tr key={seance.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{seance.date}</td>
                    <td className="p-3 font-medium">{seance.classe?.nom}</td>
                    <td className="p-3">{seance.matiere?.nom}</td>
                    <td className="p-3">{seance.heure_debut} - {seance.heure_fin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Aucune séance prévue</p>
        )}
      </div>

      {/* Classes List */}
      <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">🏫 Mes Classes</h2>
        {stats?.classes?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.classes.map(classe => (
              <div key={classe.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800">{classe.nom}</h3>
                    <p className="text-sm text-gray-500">{classe.filiere?.nom}</p>
                  </div>
                  <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    {classe.etudiants_count} étudiants
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Aucune classe assignée</p>
        )}
      </div>
    </div>
  );
}