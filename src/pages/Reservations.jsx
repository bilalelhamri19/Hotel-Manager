import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Printer, X } from 'lucide-react';
import api from '../services/api';
import Pagination from '../components/Pagination';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [clients, setClients] = useState([]);
  const [chambres, setChambres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ clientId: '', chambreId: '', dateDebut: '', dateFin: '', statutPaiement: false });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [receiptData, setReceiptData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPaiement, setFilterPaiement] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterPaiement]);

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
    setError('');

    const start = new Date(formData.dateDebut);
    const end = new Date(formData.dateFin);

    if (end <= start) {
      setError("La date de fin doit être postérieure à la date de début.");
      return;
    }

    const overlapping = reservations.find(res => {
      if (editId && res._id === editId) return false;
      if (res.chambreId !== formData.chambreId) return false;

      const resStart = new Date(res.dateDebut);
      const resEnd = new Date(res.dateFin);

      return Math.max(start, resStart) < Math.min(end, resEnd);
    });

    if (overlapping) {
      setError("La chambre est déjà réservée pour cette période.");
      return;
    }

    try {
      if (editId) {
        await api.put(`/reservations/${editId}`, formData);
      } else {
        await api.post('/reservations', formData);
      }
      setShowForm(false);
      setFormData({ clientId: '', chambreId: '', dateDebut: '', dateFin: '', statutPaiement: false });
      setEditId(null);
      fetchData(); // Refresh all data
    } catch (err) {
      console.error('Error saving reservation:', err);
      setError('Erreur lors de la sauvegarde. Veuillez réessayer.');
    }
  };

  const handleEdit = (res) => {
    setFormData({
      clientId: res.clientId,
      chambreId: res.chambreId,
      dateDebut: new Date(res.dateDebut).toISOString().split('T')[0],
      dateFin: new Date(res.dateFin).toISOString().split('T')[0],
      statutPaiement: res.statutPaiement || false
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
    setError('');
    setFormData({ clientId: '', chambreId: '', dateDebut: '', dateFin: '', statutPaiement: false });
    setEditId(null);
  };

  // Helper functions to get display names
  const getClientName = (clientId) => {
    // some backends might populate clientId, handling both cases
    const id = typeof clientId === 'object' ? clientId._id : clientId;
    const client = clients.find(c => c._id === id);
    return client ? `${client.prenom} ${client.nom}` : 'Unknown Client';
  };

  const getClientObj = (clientId) => {
    const id = typeof clientId === 'object' ? clientId._id : clientId;
    return clients.find(c => c._id === id);
  };

  const getChambreObj = (chambreId) => {
    const id = typeof chambreId === 'object' ? chambreId._id : chambreId;
    return chambres.find(c => c._id === id);
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

  // ---- Receipt / Reçu ----
  const openReceipt = (res) => {
    const client = getClientObj(res.clientId);
    const chambre = getChambreObj(res.chambreId);
    const start = new Date(res.dateDebut);
    const end = new Date(res.dateFin);
    const nights = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
    const total = chambre ? nights * chambre.prix : 0;

    setReceiptData({
      id: res._id,
      client,
      chambre,
      dateDebut: start,
      dateFin: end,
      nights,
      total,
      statutPaiement: res.statutPaiement,
    });
  };

  const printReceipt = () => {
    const content = document.getElementById('receipt-content');
    const win = window.open('', '_blank', 'width=800,height=600');
    win.document.write(`
      <html>
        <head>
          <title>Reçu de Réservation</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', sans-serif; padding: 2rem; color: #1e293b; }
            .receipt { max-width: 600px; margin: 0 auto; }
            .receipt-header { text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 1.5rem; margin-bottom: 1.5rem; }
            .receipt-header h1 { font-size: 1.75rem; color: #3b82f6; margin-bottom: 0.25rem; }
            .receipt-header p { color: #64748b; font-size: 0.875rem; }
            .receipt-ref { text-align: center; margin-bottom: 1.5rem; }
            .receipt-ref span { background: #eff6ff; color: #3b82f6; padding: 0.35rem 1rem; border-radius: 9999px; font-weight: 600; font-size: 0.875rem; }
            .section { margin-bottom: 1.25rem; }
            .section-title { font-weight: 700; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; margin-bottom: 0.5rem; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem 2rem; }
            .info-item label { display: block; font-size: 0.75rem; color: #94a3b8; }
            .info-item span { font-size: 0.95rem; font-weight: 500; }
            .divider { border: none; border-top: 1px dashed #cbd5e1; margin: 1.25rem 0; }
            .total-row { display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 1rem 1.25rem; border-radius: 10px; border: 1px solid #e2e8f0; }
            .total-row .label { font-weight: 600; color: #475569; }
            .total-row .amount { font-size: 1.5rem; font-weight: 700; color: #3b82f6; }
            .footer { text-align: center; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; }
            .footer p { font-size: 0.75rem; color: #94a3b8; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>${content.innerHTML}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  if (loading && reservations.length === 0) {
    return <div style={{ padding: '2rem' }}>Loading reservations...</div>;
  }

  // Filter available chambres for new reservations (or include current chambre if editing)
  const availableChambres = chambres.filter(c => 
    c.disponible === true || c.disponible === 'true' || (editId && c._id === formData.chambreId)
  );

  const filteredReservations = reservations.filter(res => {
    const clientName = getClientName(res.clientId).toLowerCase();
    const matchesSearch = clientName.includes(searchTerm.toLowerCase());
    
    let matchesPaiement = true;
    if (filterPaiement === 'paye') matchesPaiement = res.statutPaiement === true;
    if (filterPaiement === 'non_paye') matchesPaiement = res.statutPaiement !== true;
    
    return matchesSearch && matchesPaiement;
  });

  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const paginatedReservations = filteredReservations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
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

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Rechercher par nom de client..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-control"
          style={{ flex: '1', minWidth: '200px' }}
        />
        <select
          value={filterPaiement}
          onChange={(e) => setFilterPaiement(e.target.value)}
          className="form-control"
          style={{ width: 'auto' }}
        >
          <option value="all">Tous les paiements</option>
          <option value="paye">Payé</option>
          <option value="non_paye">Non Payé</option>
        </select>
      </div>

      {showForm && (
        <div className="form-card">
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
            {editId ? 'Edit Reservation' : 'New Reservation'}
          </h2>
          {error && <div className="error-message">{error}</div>}
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
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="statutPaiement"
                    checked={formData.statutPaiement}
                    onChange={(e) => setFormData(prev => ({ ...prev, statutPaiement: e.target.checked }))}
                    style={{ width: 'auto' }}
                  />
                  <span style={{ fontWeight: 500 }}>Marquer comme payé</span>
                </label>
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
              <th>Statut Séjour</th>
              <th>Paiement</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedReservations.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-color)', padding: '2rem' }}>
                  No reservations found.
                </td>
              </tr>
            ) : (
              paginatedReservations.map(res => (
                <tr key={res._id}>
                  <td data-label="Client" style={{ fontWeight: '500' }}>{getClientName(res.clientId)}</td>
                  <td data-label="Chambre" style={{ fontWeight: '600' }}>{getChambreNumero(res.chambreId)}</td>
                  <td data-label="Date Début">{new Date(res.dateDebut).toLocaleDateString()}</td>
                  <td data-label="Date Fin">{new Date(res.dateFin).toLocaleDateString()}</td>
                  <td data-label="Statut Séjour">{getStatutBadge(res.dateDebut, res.dateFin)}</td>
                  <td data-label="Paiement">
                    {res.statutPaiement ? (
                      <span className="badge badge-success">Payé</span>
                    ) : (
                      <span className="badge badge-warning">Non Payé</span>
                    )}
                  </td>
                  <td data-label="Actions" style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button className="btn-icon" onClick={() => openReceipt(res)} title="Reçu" style={{ color: '#10b981' }}>
                        <Printer size={18} />
                      </button>
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
        
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={setCurrentPage} 
          totalItems={filteredReservations.length} 
          itemsPerPage={itemsPerPage} 
        />
      </div>

      {/* ===== Receipt Modal ===== */}
      {receiptData && (
        <div
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setReceiptData(null)}
        >
          <div
            style={{
              background: 'var(--card-bg)', borderRadius: '16px', width: '100%', maxWidth: '520px',
              maxHeight: '90vh', overflowY: 'auto', position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setReceiptData(null)}
              style={{
                position: 'absolute', top: '1rem', right: '1rem', background: '#f1f5f9',
                border: 'none', borderRadius: '50%', width: '36px', height: '36px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>

            {/* Receipt content (this div is what gets printed) */}
            <div id="receipt-content" style={{ padding: '2.5rem 2rem' }}>
              {/* Header */}
              <div style={{ textAlign: 'center', borderBottom: '3px solid #3b82f6', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#3b82f6', margin: 0 }}>Hotel Manager</h1>
                <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>Reçu de Réservation</p>
              </div>

              {/* Reference + Date */}
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <span style={{
                  background: '#eff6ff', color: '#3b82f6', padding: '0.35rem 1rem',
                  borderRadius: '9999px', fontWeight: 600, fontSize: '0.85rem',
                }}>
                  Réf: {receiptData.id?.slice(-8)?.toUpperCase()}
                </span>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  Émis le {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>

              {/* Client Info */}
              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', marginBottom: '0.5rem' }}>
                  Informations du Client
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 2rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8' }}>Nom complet</label>
                    <span style={{ fontWeight: 500 }}>
                      {receiptData.client ? `${receiptData.client.prenom} ${receiptData.client.nom}` : '—'}
                    </span>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8' }}>Téléphone</label>
                    <span style={{ fontWeight: 500 }}>
                      {receiptData.client?.telephone || '—'}
                    </span>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8' }}>Email</label>
                    <span style={{ fontWeight: 500 }}>
                      {receiptData.client?.email || '—'}
                    </span>
                  </div>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px dashed #cbd5e1', margin: '1.25rem 0' }} />

              {/* Room Info */}
              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', marginBottom: '0.5rem' }}>
                  Détails de la Chambre
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 2rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8' }}>Numéro</label>
                    <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                      #{receiptData.chambre?.numero || '—'}
                    </span>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8' }}>Type</label>
                    <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>
                      {receiptData.chambre?.type || '—'}
                    </span>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8' }}>Prix / nuit</label>
                    <span style={{ fontWeight: 500 }}>
                      {receiptData.chambre?.prix || 0} €
                    </span>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8' }}>Nombre de nuits</label>
                    <span style={{ fontWeight: 500 }}>
                      {receiptData.nights}
                    </span>
                  </div>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px dashed #cbd5e1', margin: '1.25rem 0' }} />

              {/* Dates */}
              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', marginBottom: '0.5rem' }}>
                  Période de Séjour
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 2rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8' }}>Arrivée</label>
                    <span style={{ fontWeight: 500 }}>
                      {receiptData.dateDebut.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8' }}>Départ</label>
                    <span style={{ fontWeight: 500 }}>
                      {receiptData.dateFin.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px dashed #cbd5e1', margin: '1.25rem 0' }} />

              {/* Total */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: receiptData.statutPaiement ? '#f0fdf4' : '#f8fafc',
                padding: '1rem 1.25rem', borderRadius: '10px',
                border: '1px solid', borderColor: receiptData.statutPaiement ? '#bbf7d0' : '#e2e8f0',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 600, color: receiptData.statutPaiement ? '#166534' : '#475569' }}>
                    Total à payer
                  </span>
                  {receiptData.statutPaiement && (
                    <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, marginTop: '0.25rem' }}>
                      ✓ Payé
                    </span>
                  )}
                  {!receiptData.statutPaiement && (
                    <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600, marginTop: '0.25rem' }}>
                      ⚠ Non Payé
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: receiptData.statutPaiement ? '#15803d' : '#3b82f6' }}>{receiptData.total} €</span>
              </div>

              {/* Footer */}
              <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Merci pour votre confiance !</p>
                <p style={{ fontSize: '0.7rem', color: '#cbd5e1', marginTop: '0.25rem' }}>Hotel Manager © {new Date().getFullYear()}</p>
              </div>
            </div>

            {/* Print button (outside receipt-content so it won't appear in print) */}
            <div style={{ padding: '0 2rem 2rem', display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={printReceipt}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                <Printer size={18} />
                Imprimer le Reçu
              </button>
              <button
                onClick={() => setReceiptData(null)}
                className="btn"
                style={{ backgroundColor: '#f1f5f9', color: '#475569' }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservations;
