import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Login from '../pages/Login';
import Inscription from '../pages/Inscription';
import Presentation from '../pages/Presentation';
import Contact from '../pages/Contact';
import CoursPublic from '../pages/CoursPublic';
import EvenementsPublic from '../pages/EvenementsPublic';
import Dashboard from '../pages/Dashboard';
import Classes from '../pages/Classes';
import Professeurs from '../pages/Professeurs';
import Rapports from '../pages/Rapports';
import ProfessorDashboard from '../pages/ProfessorDashboard';
import ProfessorAttendance from '../pages/ProfessorAttendance';
import ProfessorCours from '../pages/ProfessorCours';
import EtudiantDashboard from '../pages/EtudiantDashboard';
import Evenements from '../pages/Evenements';
import MesEvenements from '../pages/MesEvenements';
import Absences from '../pages/Absences';
import EmploiDuTemps from '../pages/EmploiDuTemps';
import Layout from '../components/common/Layout';

function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Chargement...</p>
      </div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" replace />;
  
  if (user.role === 'etudiant' && !user.is_active) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  
  return <Layout>{children}</Layout>;
}

function ProfessorRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Chargement...</p>
      </div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'professor') return <Navigate to="/" replace />;
  
  return <Layout>{children}</Layout>;
}

function EtudiantRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Chargement...</p>
      </div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'etudiant') return <Navigate to="/" replace />;
  
  return <Layout>{children}</Layout>;
}

function DirecteurRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Chargement...</p>
      </div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'directeur') return <Navigate to="/" replace />;
  
  return <Layout>{children}</Layout>;
}

export default function AppRouter() {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Presentation />} />
        <Route path="/presentation" element={<Presentation />} />
        <Route path="/cours" element={<CoursPublic />} />
        <Route path="/evenements" element={<EvenementsPublic />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/inscription" element={<Inscription />} />
        
        {/* Dashboard (adaptive based on role) */}
        <Route path="/dashboard" element={
          user?.role === 'professor' ? <ProfessorRoute><ProfessorDashboard /></ProfessorRoute> :
          user?.role === 'etudiant' ? <EtudiantRoute><EtudiantDashboard /></EtudiantRoute> :
          user?.role === 'directeur' ? <DirecteurRoute><Dashboard /></DirecteurRoute> :
          <Navigate to="/login" />
        } />
        
        {/* Absences (shared) */}
        <Route path="/absences" element={
          user?.role === 'directeur' ? 
          <DirecteurRoute><Absences /></DirecteurRoute> : 
          <Navigate to="/" />
        } />
        
        {/* Director only */}
        <Route path="/classes" element={<DirecteurRoute><Classes /></DirecteurRoute>} />
        <Route path="/professeurs" element={<DirecteurRoute><Professeurs /></DirecteurRoute>} />
        <Route path="/rapports" element={<DirecteurRoute><Rapports /></DirecteurRoute>} />
        <Route path="/evenements-gestion" element={<DirecteurRoute><Evenements /></DirecteurRoute>} />
        <Route path="/emplois-du-temps" element={<DirecteurRoute><EmploiDuTemps /></DirecteurRoute>} />
        
        {/* Professor only - 3 pages */}
        <Route path="/prof-dashboard" element={<ProfessorRoute><ProfessorDashboard /></ProfessorRoute>} />
        <Route path="/prof-absences" element={<ProfessorRoute><ProfessorAttendance /></ProfessorRoute>} />
        <Route path="/prof-cours" element={<ProfessorRoute><ProfessorCours /></ProfessorRoute>} />
        
        {/* Student only */}
        <Route path="/etudiant" element={<EtudiantRoute><EtudiantDashboard /></EtudiantRoute>} />
        <Route path="/mes-evenements" element={<EtudiantRoute><MesEvenements /></EtudiantRoute>} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}