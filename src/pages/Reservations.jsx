import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../services/api';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [clients, setClients] = useState([]);
  const [chambres, setChambres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ clientId: '', chambreId: '', dateDebut: '', dateFin: '' });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resData, cliData, chamData] = await Promise.all([
        api.get('/reservations'),
        api.get('/clients'),
        api.get('/chambres')
      ]);
      setReservations(resData.data);
      setClients(cliData.data);
      setChambres(chamData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/reservations/${editId}`, formData);
      } else {
        await api.post('/reservations', formData);
        
        // After adding, we also need to update chambre availability
        // Some backends do it automatically, if not, we can trigger an update.
        // As per requirements: "After adding reservation, refresh chambres and reservations"
      }
      setShowForm(false);
      setFormData({ clientId: '', chambreId: '', dateDebut: '', dateFin: '' });
      setEditId(null);
      fetchData(); // Refresh all data
    } catch (error) {
      console.error('Error saving reservation:', error);
      alert('Error saving reservation. Please try again.');
    }
  };

  const handleEdit = (res) => {
    setFormData({
      clientId: res.clientId,
      chambreId: res.chambreId,
      dateDebut: new Date(res.dateDebut).toISOString().split('T')[0],
      dateFin: new Date(res.dateFin).toISOString().split('T')[0]
    });
    setEditId(res._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this reservation?')) {
      try {
        await api.delete(`/reservations/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting reservation:', error);
        alert('Error deleting reservation.');
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setFormData({ clientId: '', chambreId: '', dateDebut: '', dateFin: '' });
    setEditId(null);
  };

  // Helper functions to get display names
  const getClientName = (clientId) => {
    // some backends might populate clientId, handling both cases
    const id = typeof clientId === 'object' ? clientId._id : clientId;
    const client = clients.find(c => c._id === id);
    return client ? `${client.prenom} ${client.nom}` : 'Unknown Client';
  };

  const getChambreNumero = (chambreId) => {
    const id = typeof chambreId === 'object' ? chambreId._id : chambreId;
    const chambre = chambres.find(c => c._id === id);
    return chambre ? `#${chambre.numero}` : 'Unknown Room';
  };

  const getStatutBadge = (dateDebut, dateFin) => {
    const today = new Date();
    const start = new Date(dateDebut);
    const end = new Date(dateFin);
    
    if (today < start) {
      return <span className="badge badge-warning">A Venir</span>;
    } else if (today >= start && today <= end) {
      return <span className="badge badge-success">En Cours</span>;
    } else {
      return <span className="badge" style={{ backgroundColor: '#e2e8f0', color: '#475569' }}>Terminée</span>;
    }
  };

  if (loading && reservations.length === 0) {
    return <div style={{ padding: '2rem' }}>Loading reservations...</div>;
  }

  // Filter available chambres for new reservations (or include current chambre if editing)
  const availableChambres = chambres.filter(c => 
    c.disponible === true || c.disponible === 'true' || (editId && c._id === formData.chambreId)
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Reservations</h1>
          <p style={{ color: 'var(--text-color)' }}>Manage hotel bookings</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={20} />
          Add Reservation
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
            {editId ? 'Edit Reservation' : 'New Reservation'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Client</label>
                <select
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a client</option>
                  {clients.map(client => (
                    <option key={client._id} value={client._id}>
                      {client.prenom} {client.nom} ({client.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Chambre (Available only)</label>
                <select
                  name="chambreId"
                  value={formData.chambreId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a room</option>
                  {availableChambres.map(chambre => (
                    <option key={chambre._id} value={chambre._id}>
                      Chambre #{chambre.numero} - {chambre.type} ({chambre.prix}€)
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Date Début</label>
                <input
                  type="date"
                  name="dateDebut"
                  value={formData.dateDebut}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Date Fin</label>
                <input
                  type="date"
                  name="dateFin"
                  value={formData.dateFin}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editId ? 'Update Reservation' : 'Save Reservation'}
              </button>
              <button type="button" className="btn" style={{ backgroundColor: '#f1f5f9', color: 'var(--text-color)' }} onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Client</th>
              <th>Chambre</th>
              <th>Date Début</th>
              <th>Date Fin</th>
              <th>Statut</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-color)', padding: '2rem' }}>
                  No reservations found.
                </td>
              </tr>
            ) : (
              reservations.map(res => (
                <tr key={res._id}>
                  <td data-label="Client" style={{ fontWeight: '500' }}>{getClientName(res.clientId)}</td>
                  <td data-label="Chambre" style={{ fontWeight: '600' }}>{getChambreNumero(res.chambreId)}</td>
                  <td data-label="Date Début">{new Date(res.dateDebut).toLocaleDateString()}</td>
                  <td data-label="Date Fin">{new Date(res.dateFin).toLocaleDateString()}</td>
                  <td data-label="Statut">{getStatutBadge(res.dateDebut, res.dateFin)}</td>
                  <td data-label="Actions" style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button className="btn-icon edit" onClick={() => handleEdit(res)} title="Edit">
                        <Edit2 size={18} />
                      </button>
                      <button className="btn-icon delete" onClick={() => handleDelete(res._id)} title="Delete">
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

export default Reservations;
