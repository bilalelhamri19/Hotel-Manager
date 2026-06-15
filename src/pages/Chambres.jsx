import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, LayoutGrid, List } from 'lucide-react';
import api from '../services/api';
import Pagination from '../components/Pagination';

const Chambres = () => {
  const [chambres, setChambres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ numero: '', type: 'simple', prix: '', disponible: true });
  const [editId, setEditId] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterDispo, setFilterDispo] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchChambres();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, filterDispo]);

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

  const filteredChambres = chambres.filter(chambre => {
    let matchesType = true;
    let matchesDispo = true;
    
    if (filterType !== 'all') matchesType = chambre.type === filterType;
    
    if (filterDispo !== 'all') {
      const isDispo = chambre.disponible === true || chambre.disponible === 'true';
      if (filterDispo === 'dispo') matchesDispo = isDispo;
      if (filterDispo === 'occupe') matchesDispo = !isDispo;
    }
    
    return matchesType && matchesDispo;
  });

  const totalPages = Math.ceil(filteredChambres.length / itemsPerPage);
  const paginatedChambres = filteredChambres.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getImageForType = (type) => {
    if (type === 'simple') return 'https://images.unsplash.com/photo-1598928506311-c55dd1b31bb1?auto=format&fit=crop&w=400&q=80';
    if (type === 'double') return 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80';
    if (type === 'suite') return 'https://images.unsplash.com/photo-1582719478250-c89404bb8a0e?auto=format&fit=crop&w=400&q=80';
    return 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=400&q=80';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Chambres</h1>
          <p style={{ color: 'var(--text-color)' }}>Manage hotel rooms and availability</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className={`btn-icon ${viewMode === 'grid' ? 'active' : ''}`} 
            onClick={() => setViewMode('grid')}
            style={viewMode === 'grid' ? { background: 'var(--primary-light)', color: 'var(--primary-color)' } : {}}
          >
            <LayoutGrid size={20} />
          </button>
          <button 
            className={`btn-icon ${viewMode === 'table' ? 'active' : ''}`} 
            onClick={() => setViewMode('table')}
            style={viewMode === 'table' ? { background: 'var(--primary-light)', color: 'var(--primary-color)' } : {}}
          >
            <List size={20} />
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={20} />
            Add Chambre
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="form-control"
          style={{ width: 'auto' }}
        >
          <option value="all">Tous les types</option>
          <option value="simple">Simple</option>
          <option value="double">Double</option>
          <option value="suite">Suite</option>
        </select>
        <select
          value={filterDispo}
          onChange={(e) => setFilterDispo(e.target.value)}
          className="form-control"
          style={{ width: 'auto' }}
        >
          <option value="all">Toutes disponibilités</option>
          <option value="dispo">Disponible</option>
          <option value="occupe">Occupée</option>
        </select>
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

      {viewMode === 'grid' ? (
        <div className="room-cards-grid">
          {paginatedChambres.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--text-color)' }}>No chambres found.</div>
          ) : (
            paginatedChambres.map(chambre => {
              const isDisponible = chambre.disponible === true || chambre.disponible === 'true';
              return (
                <div key={chambre._id} className="room-card">
                  <img src={getImageForType(chambre.type)} alt={chambre.type} className="room-card-image" />
                  <div className="room-card-body">
                    <div className="room-card-header">
                      <span className="room-card-title">Chambre #{chambre.numero}</span>
                      <span className={`badge ${isDisponible ? 'badge-success' : 'badge-danger'}`}>
                        {isDisponible ? 'Disponible' : 'Réservée'}
                      </span>
                    </div>
                    <div style={{ color: 'var(--text-color)', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'capitalize' }}>
                      Type: {chambre.type}
                    </div>
                    <div className="room-card-price">
                      {chambre.prix} € / nuit
                    </div>
                    <div className="room-card-actions">
                      <button className="btn-icon edit" onClick={() => handleEdit(chambre)} title="Edit" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                        <Edit2 size={18} />
                      </button>
                      <button className="btn-icon delete" onClick={() => handleDelete(chambre._id)} title="Delete" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
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
              {paginatedChambres.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-color)', padding: '2rem' }}>
                    No chambres found.
                  </td>
                </tr>
              ) : (
                paginatedChambres.map(chambre => {
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
      )}
      
      <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={setCurrentPage} 
          totalItems={filteredChambres.length} 
          itemsPerPage={itemsPerPage} 
        />
    </div>
  );
};

export default Chambres;
