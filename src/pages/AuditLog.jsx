import { useState } from 'react';
import { Activity, ShieldAlert, UserPlus, FileEdit, Trash2 } from 'lucide-react';
import Pagination from '../components/Pagination';

const mockLogs = [
  { id: 1, user: 'admin@hotel.com', action: 'Connexion réussie', type: 'auth', date: new Date().toISOString() },
  { id: 2, user: 'admin@hotel.com', action: 'Création d\'une réservation (Réf: #R1)', type: 'create', date: new Date(Date.now() - 3600000).toISOString() },
  { id: 3, user: 'manager@hotel.com', action: 'Modification du client (Mohammed)', type: 'update', date: new Date(Date.now() - 7200000).toISOString() },
  { id: 4, user: 'admin@hotel.com', action: 'Suppression d\'une chambre', type: 'delete', date: new Date(Date.now() - 86400000).toISOString() },
  { id: 5, user: 'system', action: 'Sauvegarde automatique de la base de données', type: 'system', date: new Date(Date.now() - 172800000).toISOString() },
  { id: 6, user: 'admin@hotel.com', action: 'Ajout de 5 nouvelles chambres', type: 'create', date: new Date(Date.now() - 259200000).toISOString() },
];

const AuditLog = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getIcon = (type) => {
    switch(type) {
      case 'auth': return <ShieldAlert size={16} style={{ color: '#3b82f6' }} />;
      case 'create': return <UserPlus size={16} style={{ color: '#10b981' }} />;
      case 'update': return <FileEdit size={16} style={{ color: '#f59e0b' }} />;
      case 'delete': return <Trash2 size={16} style={{ color: '#ef4444' }} />;
      default: return <Activity size={16} style={{ color: 'var(--text-color)' }} />;
    }
  };

  const paginatedLogs = mockLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Journal d'Audit</h1>
          <p style={{ color: 'var(--text-color)' }}>Historique des activités système</p>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date & Heure</th>
              <th>Utilisateur</th>
              <th>Action</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLogs.map(log => (
              <tr key={log.id}>
                <td data-label="Date">{new Date(log.date).toLocaleString()}</td>
                <td data-label="Utilisateur" style={{ fontWeight: '500' }}>{log.user}</td>
                <td data-label="Action">{log.action}</td>
                <td data-label="Type">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {getIcon(log.type)}
                    <span style={{ textTransform: 'capitalize' }}>{log.type}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Pagination 
          currentPage={currentPage} 
          totalPages={Math.ceil(mockLogs.length / itemsPerPage)} 
          onPageChange={setCurrentPage} 
          totalItems={mockLogs.length} 
          itemsPerPage={itemsPerPage} 
        />
      </div>
    </div>
  );
};

export default AuditLog;
