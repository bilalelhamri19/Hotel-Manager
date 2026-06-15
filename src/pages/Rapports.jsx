import { useState, useEffect } from 'react';
import { TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import api from '../services/api';

const Rapports = () => {
  const [data, setData] = useState({ reservations: [], chambres: [], clients: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resData, chamData, cliData] = await Promise.all([
        api.get('/reservations'),
        api.get('/chambres'),
        api.get('/clients')
      ]);
      setData({
        reservations: resData.data,
        chambres: chamData.data,
        clients: cliData.data
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Chargement des rapports...</div>;

  // Simple stats
  const totalRevenue = data.reservations.filter(r => r.statutPaiement).length * 150; // Mock calculation
  const occupancyRate = (data.chambres.filter(c => !c.disponible).length / (data.chambres.length || 1)) * 100;

  // Mock chart data
  const revenueData = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Fév', revenue: 3000 },
    { name: 'Mar', revenue: 5000 },
    { name: 'Avr', revenue: 4500 },
    { name: 'Mai', revenue: 6000 },
    { name: 'Juin', revenue: Math.max(1000, totalRevenue) }
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Rapports & Analytique</h1>
          <p style={{ color: 'var(--text-color)' }}>Performances de votre hôtel</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <p>Revenus Mensuels</p>
            <h3>{totalRevenue} €</h3>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <p>Taux d'Occupation</p>
            <h3>{occupancyRate.toFixed(1)}%</h3>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <p>Réservations (Mois)</p>
            <h3>{data.reservations.length}</h3>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <Users size={24} />
          </div>
          <div className="stat-info">
            <p>Nouveaux Clients</p>
            <h3>{data.clients.length}</h3>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Évolution des Revenus</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Line type="monotone" dataKey="revenue" stroke="var(--primary-color)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Réservations par Mois</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="revenue" fill="var(--success)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rapports;
