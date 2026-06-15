import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GlobalSearch = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
      }
      if (isOpen && e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate('/clients');
      onClose();
    }
  };

  return (
    <div className="modal-overlay" style={{ display: 'flex', alignItems: 'flex-start', paddingTop: '10vh', paddingLeft: '1rem', paddingRight: '1rem' }} onClick={onClose}>
      <div className="card" style={{ width: '100%', maxWidth: '600px', padding: '1rem' }} onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Search size={24} style={{ color: 'var(--text-color)' }} />
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher clients, réservations..."
            style={{ flex: 1, fontSize: '1.2rem', color: 'var(--text-main)' }}
          />
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={24} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default GlobalSearch;
