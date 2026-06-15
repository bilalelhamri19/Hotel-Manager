import { useState, useEffect } from 'react';
import { FileText, Printer, X, Download } from 'lucide-react';
import api from '../services/api';

const Paiements = () => {
  const [reservations, setReservations] = useState([]);
  const [clients, setClients] = useState([]);
  const [chambres, setChambres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('historique');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resData, cliData, chData] = await Promise.all([
        api.get('/reservations'),
        api.get('/clients'),
        api.get('/chambres')
      ]);
      setReservations(resData.data);
      setClients(cliData.data);
      setChambres(chData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getClientName = (clientId) => {
    const id = typeof clientId === 'object' ? clientId._id : clientId;
    const client = clients.find(c => c._id === id);
    return client ? `${client.prenom} ${client.nom}` : 'Inconnu';
  };

  const getClient = (clientId) => {
    const id = typeof clientId === 'object' ? clientId._id : clientId;
    return clients.find(c => c._id === id);
  };

  const getChambre = (chambreId) => {
    const id = typeof chambreId === 'object' ? chambreId._id : chambreId;
    return chambres.find(c => c._id === id);
  };

  const calculateNights = (dateDebut, dateFin) => {
    const start = new Date(dateDebut);
    const end = new Date(dateFin);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  const paidReservations = reservations.filter(r => r.statutPaiement);
  const unpaidReservations = reservations.filter(r => !r.statutPaiement);

  const openReceipt = (res) => {
    const client = getClient(res.clientId);
    const chambre = getChambre(res.chambreId);
    const nights = calculateNights(res.dateDebut, res.dateFin);
    const prixNuit = chambre ? chambre.prix : 0;
    const total = nights * prixNuit;

    setSelectedReceipt({
      id: res._id,
      ref: '#' + res._id.slice(-6).toUpperCase(),
      client: client ? `${client.prenom} ${client.nom}` : 'Inconnu',
      clientEmail: client ? client.email : '',
      clientTel: client ? client.telephone : '',
      chambre: chambre ? `Chambre ${chambre.numero} — ${chambre.type}` : 'N/A',
      dateDebut: new Date(res.dateDebut).toLocaleDateString('fr-FR'),
      dateFin: new Date(res.dateFin).toLocaleDateString('fr-FR'),
      nights,
      prixNuit,
      total,
      datePaiement: new Date(res.dateFin).toLocaleDateString('fr-FR'),
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Finance</h1>
          <p style={{ color: 'var(--text-color)' }}>Gestion des paiements et factures</p>
        </div>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'historique' ? 'active' : ''}`}
          onClick={() => setActiveTab('historique')}
        >
          Historique des Paiements
        </button>
        <button 
          className={`tab ${activeTab === 'factures' ? 'active' : ''}`}
          onClick={() => setActiveTab('factures')}
        >
          Factures en attente
        </button>
      </div>

      {activeTab === 'historique' && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Réf</th>
                <th>Client</th>
                <th>Date</th>
                <th>Statut</th>
                <th style={{ textAlign: 'right' }}>Reçu</th>
              </tr>
            </thead>
            <tbody>
              {paidReservations.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>Aucun paiement trouvé.</td>
                </tr>
              ) : (
                paidReservations.map(res => (
                  <tr key={res._id}>
                    <td data-label="Réf" style={{ fontWeight: '600' }}>#{res._id.slice(-6).toUpperCase()}</td>
                    <td data-label="Client">{getClientName(res.clientId)}</td>
                    <td data-label="Date">{new Date(res.dateFin).toLocaleDateString()}</td>
                    <td data-label="Statut"><span className="badge badge-success">Payé</span></td>
                    <td data-label="Reçu" style={{ textAlign: 'right' }}>
                      <button className="btn-icon" style={{ color: 'var(--primary-color)' }} onClick={() => openReceipt(res)}>
                        <FileText size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'factures' && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Réf Réservation</th>
                <th>Client</th>
                <th>Échéance</th>
                <th>Statut</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {unpaidReservations.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>Aucune facture en attente.</td>
                </tr>
              ) : (
                unpaidReservations.map(res => (
                  <tr key={res._id}>
                    <td data-label="Réf" style={{ fontWeight: '600' }}>#{res._id.slice(-6).toUpperCase()}</td>
                    <td data-label="Client">{getClientName(res.clientId)}</td>
                    <td data-label="Échéance">{new Date(res.dateDebut).toLocaleDateString()}</td>
                    <td data-label="Statut"><span className="badge badge-warning">En attente</span></td>
                    <td data-label="Actions" style={{ textAlign: 'right' }}>
                      <button className="btn-icon" title="Voir le reçu" style={{ color: 'var(--text-color)' }} onClick={() => openReceipt(res)}>
                        <FileText size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ===== RECEIPT MODAL ===== */}
      {selectedReceipt && (
        <div className="modal-overlay" onClick={() => setSelectedReceipt(null)}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--card-bg)',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '520px',
              margin: '0 1rem',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '1.5rem 1.5rem 1rem', borderBottom: '1px solid var(--border-color)',
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Reçu de paiement</h2>
                <p style={{ margin: 0, color: 'var(--text-color)', fontSize: '0.875rem' }}>
                  {selectedReceipt.ref}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn-icon" onClick={handlePrint} title="Imprimer">
                  <Printer size={20} />
                </button>
                <button className="btn-icon" onClick={() => setSelectedReceipt(null)}>
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '1.5rem' }}>
              {/* Hotel info */}
              <div style={{
                textAlign: 'center', marginBottom: '1.5rem',
                padding: '1rem', background: 'var(--bg-color)', borderRadius: '12px',
              }}>
                <h3 style={{ color: 'var(--primary-color)', margin: '0 0 0.25rem' }}>🏨 Hotel Manager</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-color)' }}>
                  123 Avenue Mohammed V, Casablanca
                </p>
              </div>

              {/* Client */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: 'var(--text-color)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                  Informations Client
                </h4>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-color)', fontSize: '0.9rem' }}>Nom</span>
                    <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{selectedReceipt.client}</span>
                  </div>
                  {selectedReceipt.clientEmail && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-color)', fontSize: '0.9rem' }}>Email</span>
                      <span style={{ fontSize: '0.9rem' }}>{selectedReceipt.clientEmail}</span>
                    </div>
                  )}
                  {selectedReceipt.clientTel && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-color)', fontSize: '0.9rem' }}>Téléphone</span>
                      <span style={{ fontSize: '0.9rem' }}>{selectedReceipt.clientTel}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Séjour */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: 'var(--text-color)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                  Détails du Séjour
                </h4>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-color)', fontSize: '0.9rem' }}>Chambre</span>
                    <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>{selectedReceipt.chambre}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-color)', fontSize: '0.9rem' }}>Arrivée</span>
                    <span style={{ fontSize: '0.9rem' }}>{selectedReceipt.dateDebut}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-color)', fontSize: '0.9rem' }}>Départ</span>
                    <span style={{ fontSize: '0.9rem' }}>{selectedReceipt.dateFin}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-color)', fontSize: '0.9rem' }}>Durée</span>
                    <span style={{ fontSize: '0.9rem' }}>{selectedReceipt.nights} nuit(s)</span>
                  </div>
                </div>
              </div>

              {/* Montant */}
              <div style={{
                background: 'var(--bg-color)', borderRadius: '12px', padding: '1.25rem',
                marginBottom: '1.5rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-color)', fontSize: '0.9rem' }}>
                    {selectedReceipt.nights} nuit(s) × {selectedReceipt.prixNuit}€
                  </span>
                  <span style={{ fontSize: '0.9rem' }}>{selectedReceipt.total}€</span>
                </div>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  borderTop: '2px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.5rem',
                }}>
                  <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>Total</span>
                  <span style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--primary-color)' }}>
                    {selectedReceipt.total}€
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div style={{ textAlign: 'center', color: 'var(--text-color)', fontSize: '0.8rem' }}>
                <p style={{ margin: '0 0 0.25rem' }}>Merci pour votre séjour !</p>
                <p style={{ margin: 0 }}>Date: {selectedReceipt.datePaiement}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Paiements;
