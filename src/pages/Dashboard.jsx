import { useState, useEffect } from 'react';
import { Users, Bed, CalendarCheck, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalChambres: 0,
    totalReservations: 0,
    chambresDisponibles: 0,
    chambresReservees: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [clientsRes, chambresRes, reservationsRes] = await Promise.all([
          api.get('/clients'),
          api.get('/chambres'),
          api.get('/reservations')
        ]);

        const clients = clientsRes.data;
        const chambres = chambresRes.data;
        const reservations = reservationsRes.data;

        const disponibles = chambres.filter(c => c.disponible === true || c.disponible === 'true').length;
        const reservees = chambres.length - disponibles;

        setStats({
          totalClients: clients.length,
          totalChambres: chambres.length,
          totalReservations: reservations.length,
          chambresDisponibles: disponibles,
          chambresReservees: reservees
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading dashboard...</div>;
  }

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p style={{ color: 'var(--text-color)' }}>Welcome back, {user?.email || 'Admin'}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <Users size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-color)', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Total Clients</p>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{stats.totalClients}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
            <Bed size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-color)', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Total Chambres</p>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{stats.totalChambres}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>
            <CalendarCheck size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-color)', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Total Reservations</p>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{stats.totalReservations}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <CheckCircle size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-color)', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Chambres Disponibles</p>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{stats.chambresDisponibles}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <XCircle size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-color)', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Chambres Réservées</p>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{stats.chambresReservees}</h3>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
