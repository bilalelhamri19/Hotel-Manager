import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import api from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({ nom: '', prenom: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/register', formData);
      setSuccess('Compte créé avec succès. Vous allez être redirigé...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création du compte.');
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="auth-container">
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', marginBottom: '1rem' }}>
            <UserPlus size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)' }}>Créer un compte</h2>
          <p style={{ color: 'var(--text-color)' }}>Rejoignez Hotel Manager</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleRegister}>
          <div className="form-grid" style={{ gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
              <label>Prénom</label>
              <input type="text" name="prenom" value={formData.prenom} onChange={handleInputChange} required />
            </div>
            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
              <label>Nom</label>
              <input type="text" name="nom" value={formData.nom} onChange={handleInputChange} required />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
          </div>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleInputChange} required minLength="6" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            S'inscrire
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
          Vous avez déjà un compte ? <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}>Se connecter</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
