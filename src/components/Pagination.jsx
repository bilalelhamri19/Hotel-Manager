import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
  if (totalPages <= 1) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderTop: '1px solid var(--border-color)', marginTop: '1rem' }}>
      <span style={{ fontSize: '0.875rem', color: 'var(--text-color)' }}>
        Affichage de {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, totalItems)} sur {totalItems} éléments
      </span>
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        <button 
          className="btn-icon" 
          onClick={() => onPageChange(currentPage - 1)} 
          disabled={currentPage === 1}
          style={currentPage === 1 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
        >
          <ChevronLeft size={18} />
        </button>
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            className={`btn-icon ${currentPage === i + 1 ? 'active' : ''}`}
            onClick={() => onPageChange(i + 1)}
            style={currentPage === i + 1 ? { background: 'var(--primary-color)', color: 'white' } : {}}
          >
            {i + 1}
          </button>
        ))}
        <button 
          className="btn-icon" 
          onClick={() => onPageChange(currentPage + 1)} 
          disabled={currentPage === totalPages}
          style={currentPage === totalPages ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
