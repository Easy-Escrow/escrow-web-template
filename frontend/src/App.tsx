import { Link, Outlet, useNavigate } from 'react-router-dom';

import { useAuth } from '@/auth/authHooks';

import styles from '@/app.module.css';

export function App() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <h1>Escrow Starter</h1>
        <nav>
          <ul>
            {isAuthenticated ? (
              <>
                <li>
                  <Link to="/">Dashboard</Link>
                </li>
                <li>
                  <Link to="/settings">Settings</Link>
                </li>
                <li>
                  <button type="button" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link to="/login">Log in</Link>
              </li>
            )}
          </ul>
        </nav>
        {isAuthenticated && (
          <div className={styles.userMeta}>
            <strong>{user?.email}</strong>
            {user?.role && <span className={styles.badge}>{user.role}</span>}
          </div>
        )}
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
