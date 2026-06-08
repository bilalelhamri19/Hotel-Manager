import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Bed, CalendarCheck, LogOut, LogIn } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h2>Hotel Manager</h2>
      </div>
      <div className="navbar-menu">
        {token ? (
          <>
            <Link to="/dashboard" className="nav-item">
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </Link>
            <Link to="/clients" className="nav-item">
              <Users size={20} />
              <span>Clients</span>
            </Link>
            <Link to="/chambres" className="nav-item">
              <Bed size={20} />
              <span>Chambres</span>
            </Link>
            <Link to="/reservations" className="nav-item">
              <CalendarCheck size={20} />
              <span>Reservations</span>
            </Link>
            <button onClick={handleLogout} className="nav-item logout-btn">
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <Link to="/login" className="nav-item">
            <LogIn size={20} />
            <span>Login</span>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
