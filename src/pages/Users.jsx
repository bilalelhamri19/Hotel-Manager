import { useState, useEffect } from 'react';
import { Shield, Trash2 } from 'lucide-react';
import api from '../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Erreur lors de la suppression de l\'utilisateur.');
      }
    }
  };

  if (loading && users.length === 0) {
    return <div style={{ padding: '2rem' }}>Chargement des utilisateurs...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Utilisateurs</h1>
          <p style={{ color: 'var(--text-color)' }}>Gérer les accès au système</p>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nom complet</th>
              <th>Email</th>
              <th>Rôle</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-color)', padding: '2rem' }}>
                  Aucun utilisateur trouvé.
                </td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user._id || user.id}>
                  <td data-label="Nom" style={{ fontWeight: '500' }}>
                    {user.prenom} {user.nom}
                  </td>
                  <td data-label="Email">{user.email}</td>
                  <td data-label="Rôle">
                    <span className="badge badge-info" style={{ display: 'inline-flex', gap: '0.25rem' }}>
                      <Shield size={14} /> {user.role || 'Admin'}
                    </span>
                  </td>
                  <td data-label="Actions" style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button className="btn-icon delete" onClick={() => handleDelete(user._id || user.id)} title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
