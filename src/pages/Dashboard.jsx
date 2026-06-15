// v2.0 - Hotel Manager Pro
import { useState, useEffect } from 'react';
import { Users, Bed, CalendarCheck, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalChambres: 0,
    totalReservations: 0,
    chambresDisponibles: 0,
    chambresReservees: 0,
    revenueEstime: 0,
    typeData: [],
    dispoData: []
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

        const typesCount = chambres.reduce((acc, c) => {
          acc[c.type] = (acc[c.type] || 0) + 1;
          return acc;
        }, {});
        const typeData = Object.keys(typesCount).map(k => ({ name: k, value: typesCount[k] }));

        const dispoData = [
          { name: 'Disponibles', value: disponibles, color: '#10b981' },
          { name: 'Réservées', value: reservees, color: '#ef4444' }
        ];

        // Estimated revenue from active reservations
        const today = new Date();
        let revenueEstime = 0;
        reservations.forEach(r => {
          const start = new Date(r.dateDebut);
          const end = new Date(r.dateFin);
          if (today >= start && today <= end) {
            const chambreId = typeof r.chambreId === 'object' ? r.chambreId._id : r.chambreId;
            const c = chambres.find(ch => ch._id === chambreId);
            if (c) {
              const nights = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
              revenueEstime += (nights * c.prix);
            }
          }
        });

        setStats({
          totalClients: clients.length,
          totalChambres: chambres.length,
          totalReservations: reservations.length,
          chambresDisponibles: disponibles,
          chambresReservees: reservees,
          revenueEstime,
          typeData,
          dispoData
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

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: 'rgba(234, 179, 8, 0.1)', color: '#eab308' }}>
            <DollarSign size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-color)', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Revenu Actuel</p>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{stats.revenueEstime} €</h3>
          </div>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.125rem' }}>Types de Chambres</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.typeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8b5cf6"
                  label
                >
                  {stats.typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#3b82f6', '#ec4899', '#f59e0b', '#10b981'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.125rem' }}>Occupation des Chambres</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.dispoData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {stats.dispoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
