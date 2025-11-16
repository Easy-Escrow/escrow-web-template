import { Link, Outlet } from 'react-router-dom';

import styles from './app.module.css';

export function App() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <h1>Escrow Starter</h1>
        <nav>
          <ul>
            <li>
              <Link to="/">Dashboard</Link>
            </li>
            <li>
              <Link to="/settings">Settings</Link>
            </li>
          </ul>
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
