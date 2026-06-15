import { Navigate, useLocation } from 'react-router-dom';

/**
 * AdminRoute – renders children only if the logged‑in user has role "admin".
 * The role is stored in localStorage after a successful login.
 */
const AdminRoute = ({ children }) => {
  const location = useLocation();
  const role = localStorage.getItem('role');

  if (role !== 'admin') {
    // Redirect non‑admin users to the dashboard (or a 403 page)
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }
  return children;
};

export default AdminRoute;
