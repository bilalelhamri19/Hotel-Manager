import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Bed, CalendarCheck, Calendar as CalendarIcon, LogOut, LogIn, Menu, X, Moon, Sun, Search, UserCog, CreditCard, BarChart, Activity } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';
import GlobalSearch from './GlobalSearch';
import NotificationBell from './NotificationBell';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      const { supabase } = await import('../lib/supabase');
      await supabase.auth.signOut();
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsOpen(false);
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="mobile-header">
        <div className="navbar-logo-container-mobile">
          <img src="/logo.png" alt="Hotel Logo" className="navbar-logo-mobile" />
          <h2 className="mobile-brand-title">Hotel</h2>
        </div>
        <div className="mobile-header-actions">
          {token && (
            <>
              <button className="icon-btn" onClick={() => setIsSearchOpen(true)}>
                <Search size={20} />
              </button>
              <NotificationBell />
            </>
          )}
          <button className="icon-btn" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button 
            className="menu-toggle-btn" 
            onClick={() => setIsOpen(!isOpen)} 
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
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
          <div className="navbar-logo-container">
            <img src="/logo.png" alt="Hotel Logo" className="navbar-logo" />
            <h2 className="navbar-brand-title">Hotel Manager</h2>
          </div>
          <div className="db-status">
            <span className={`status-dot ${isSupabaseConfigured ? 'online' : 'offline'}`}></span>
            <span className="status-text">{isSupabaseConfigured ? 'Database: Cloud' : 'Database: Local'}</span>
          </div>
        </div>

        {token && (
          <div className="desktop-top-actions">
            <button className="search-trigger-btn" onClick={() => setIsSearchOpen(true)}>
              <Search size={18} />
              <span>Rechercher...</span>
              <kbd>Ctrl+K</kbd>
            </button>
          </div>
        )}

        <div className="navbar-menu">
          {token ? (
            <>
              <Link to="/dashboard" className="nav-item" onClick={() => setIsOpen(false)}>
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </Link>
              <Link to="/clients" className="nav-item" onClick={() => setIsOpen(false)}>
                <Users size={20} />
                <span>Clients</span>
              </Link>
              <Link to="/users" className="nav-item" onClick={() => setIsOpen(false)}>
                <UserCog size={20} />
                <span>Utilisateurs</span>
              </Link>
              <Link to="/chambres" className="nav-item" onClick={() => setIsOpen(false)}>
                <Bed size={20} />
                <span>Chambres</span>
              </Link>
              <Link to="/reservations" className="nav-item" onClick={() => setIsOpen(false)}>
                <CalendarCheck size={20} />
                <span>Reservations</span>
              </Link>
              <Link to="/calendrier" className="nav-item" onClick={() => setIsOpen(false)}>
                <CalendarIcon size={20} />
                <span>Calendrier</span>
              </Link>
              <Link to="/paiements" className="nav-item" onClick={() => setIsOpen(false)}>
                <CreditCard size={20} />
                <span>Paiements</span>
              </Link>
              <Link to="/rapports" className="nav-item" onClick={() => setIsOpen(false)}>
                <BarChart size={20} />
                <span>Rapports</span>
              </Link>
              <Link to="/audit-log" className="nav-item" onClick={() => setIsOpen(false)}>
                <Activity size={20} />
                <span>Journal d'Audit</span>
              </Link>
            </>
          ) : (
            <Link to="/login" className="nav-item" onClick={() => setIsOpen(false)}>
              <LogIn size={20} />
              <span>Login</span>
            </Link>
          )}
        </div>

        <div className="navbar-bottom-actions">
          {token && (
            <div className="desktop-utils">
              <NotificationBell />
              <button className="nav-icon-btn" onClick={toggleTheme} aria-label="Toggle Dark Mode">
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          )}
          {token && (
            <button onClick={handleLogout} className="nav-item logout-btn">
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          )}
        </div>
      </nav>

      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Navbar;
