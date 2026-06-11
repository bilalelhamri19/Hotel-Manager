import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../services/api';

const Chambres = () => {
  const [chambres, setChambres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ numero: '', type: 'simple', prix: '', disponible: true });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchChambres();
  }, []);

  const fetchChambres = async () => {
    try {
      setLoading(true);
      const response = await api.get('/chambres');
      setChambres(response.data);
    } catch (error) {
      console.error('Error fetching chambres:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        numero: Number(formData.numero),
        prix: Number(formData.prix)
      };

      if (editId) {
        await api.put(`/chambres/${editId}`, payload);
      } else {
        await api.post('/chambres', payload);
      }
      setShowForm(false);
      setFormData({ numero: '', type: 'simple', prix: '', disponible: true });
      setEditId(null);
      fetchChambres();
    } catch (error) {
      console.error('Error saving chambre:', error);
      alert('Error saving chambre. Please try again.');
    }
  };

  const handleEdit = (chambre) => {
    setFormData({
      numero: chambre.numero,
      type: chambre.type,
      prix: chambre.prix,
      disponible: chambre.disponible === true || chambre.disponible === 'true'
    });
    setEditId(chambre._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this chambre?')) {
      try {
        await api.delete(`/chambres/${id}`);
        fetchChambres();
      } catch (error) {
        console.error('Error deleting chambre:', error);
        alert('Error deleting chambre.');
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setFormData({ numero: '', type: 'simple', prix: '', disponible: true });
    setEditId(null);
  };

  if (loading && chambres.length === 0) {
    return <div style={{ padding: '2rem' }}>Loading chambres...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Chambres</h1>
          <p style={{ color: 'var(--text-color)' }}>Manage hotel rooms and availability</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={20} />
          Add Chambre
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
            {editId ? 'Edit Chambre' : 'Add New Chambre'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Numéro</label>
                <input
                  type="number"
                  name="numero"
                  value={formData.numero}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                >
                  <option value="simple">Simple</option>
                  <option value="double">Double</option>
                  <option value="suite">Suite</option>
                </select>
              </div>
              <div className="form-group">
                <label>Prix (€)</label>
                <input
                  type="number"
                  name="prix"
                  value={formData.prix}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                <input
                  type="checkbox"
                  name="disponible"
                  id="disponible"
                  checked={formData.disponible}
                  onChange={handleInputChange}
                  style={{ width: 'auto' }}
                />
                <label htmlFor="disponible" style={{ margin: 0 }}>Disponible</label>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editId ? 'Update Chambre' : 'Save Chambre'}
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
              <th>Numéro</th>
              <th>Type</th>
              <th>Prix</th>
              <th>Disponibilité</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {chambres.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-color)', padding: '2rem' }}>
                  No chambres found.
                </td>
              </tr>
            ) : (
              chambres.map(chambre => {
                const isDisponible = chambre.disponible === true || chambre.disponible === 'true';
                return (
                  <tr key={chambre._id}>
                    <td data-label="Numéro" style={{ fontWeight: '600' }}>#{chambre.numero}</td>
                    <td data-label="Type" style={{ textTransform: 'capitalize' }}>{chambre.type}</td>
                    <td data-label="Prix">{chambre.prix} €</td>
                    <td data-label="Disponibilité">
                      <span className={`badge ${isDisponible ? 'badge-success' : 'badge-danger'}`}>
                        {isDisponible ? 'Disponible' : 'Réservée'}
                      </span>
                    </td>
                    <td data-label="Actions" style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button className="btn-icon edit" onClick={() => handleEdit(chambre)} title="Edit">
                          <Edit2 size={18} />
                        </button>
                        <button className="btn-icon delete" onClick={() => handleDelete(chambre._id)} title="Delete">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Chambres;
