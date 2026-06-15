import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Chambres from './pages/Chambres';
import Reservations from './pages/Reservations';
import Calendrier from './pages/Calendrier';


import Paiements from './pages/Paiements';
import Rapports from './pages/Rapports';
import AuditLog from './pages/AuditLog';

import './index.css';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const Layout = ({ children }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login';

  return (
    <div className="app-container">
      {!isAuthPage && <Navbar />}
      <div className={isAuthPage ? '' : 'main-content'} style={isAuthPage ? { width: '100%' } : {}}>
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Navigate to="/login" replace />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/clients" element={
            <ProtectedRoute>
              <Clients />
            </ProtectedRoute>
          } />
          <Route path="/chambres" element={
            <ProtectedRoute>
              <Chambres />
            </ProtectedRoute>
          } />

          <Route path="/reservations" element={
            <ProtectedRoute>
              <Reservations />
            </ProtectedRoute>
          } />
          <Route path="/calendrier" element={
            <ProtectedRoute>
              <Calendrier />
            </ProtectedRoute>
          } />
          <Route path="/paiements" element={
            <ProtectedRoute>
              <Paiements />
            </ProtectedRoute>
          } />
          <Route path="/rapports" element={
            <ProtectedRoute>
              <Rapports />
            </ProtectedRoute>
          } />
          <Route path="/audit-log" element={
            <ProtectedRoute>
              <AuditLog />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
