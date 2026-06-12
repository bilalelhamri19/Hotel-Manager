import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Bed, CalendarCheck, LogOut, LogIn, Menu, X } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';
import './Navbar.css';
// Logo import removed

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsOpen(false);
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="mobile-header">
        <h2 className="mobile-brand-title">Hotel Manager</h2>
        <button 
          className="menu-toggle-btn" 
          onClick={() => setIsOpen(!isOpen)} 
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Backdrop overlay when menu is open on mobile */}
      {isOpen && (
        <div 
          className="navbar-overlay" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Nav */}
      <nav className={`navbar ${isOpen ? 'is-open' : ''}`}>
        <div className="navbar-brand">
          <h2 className="navbar-brand-title">Hotel Manager</h2>
          <div className="db-status">
            <span className={`status-dot ${isSupabaseConfigured ? 'online' : 'offline'}`}></span>
            <span className="status-text">{isSupabaseConfigured ? 'Database: Cloud' : 'Database: Local'}</span>
          </div>
        </div>
        <div className="navbar-menu">
          {token ? (
            <>
              <Link 
                to="/dashboard" 
                className="nav-item" 
                onClick={() => setIsOpen(false)}
              >
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </Link>
              <Link 
                to="/clients" 
                className="nav-item" 
                onClick={() => setIsOpen(false)}
              >
                <Users size={20} />
                <span>Clients</span>
              </Link>
              <Link 
                to="/chambres" 
                className="nav-item" 
                onClick={() => setIsOpen(false)}
              >
                <Bed size={20} />
                <span>Chambres</span>
              </Link>
              <Link 
                to="/reservations" 
                className="nav-item" 
                onClick={() => setIsOpen(false)}
              >
                <CalendarCheck size={20} />
                <span>Reservations</span>
              </Link>
              <button onClick={handleLogout} className="nav-item logout-btn">
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link 
              to="/login" 
              className="nav-item" 
              onClick={() => setIsOpen(false)}
            >
              <LogIn size={20} />
              <span>Login</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
