import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const user = authService.getUser();
  const isAuthenticated = authService.isAuthenticated();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-content">
          <Link to="/dashboard" className="logo">
            <h1>FinTrack</h1>
            <span>Smart Expense Tracking</span>
          </Link>
          {isAuthenticated && (
            <nav className="main-nav">
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/expenses">Expenses</Link>
              <Link to="/categories">Categories</Link>
              <Link to="/analytics">Analytics</Link>
              <Link to="/reports">Reports</Link>
            </nav>
          )}
          <div className="header-actions">
            {isAuthenticated ? (
              <>
                {user && <span className="user-name">{user.name}</span>}
                <button onClick={handleLogout} className="btn-logout">Logout</button>
              </>
            ) : (
              <Link to="/login" className="btn-login">Login</Link>
            )}
          </div>
        </div>
      </header>
      <main className="app-content">{children}</main>
    </div>
  );
};

export default Layout;
