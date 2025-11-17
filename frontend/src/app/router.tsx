import { createBrowserRouter } from 'react-router-dom';

import App from '../App';
import { RequireAuth } from '../auth/RequireAuth';
import { DashboardPage } from '../components/DashboardPage';
import { LoginPage } from '../components/LoginPage';
import { SettingsPage } from '../components/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <RequireAuth><DashboardPage /></RequireAuth> },
      {
        path: 'settings',
        element: <RequireAuth roles={["ADMIN", "OFFICER"]}>
          <SettingsPage />
        </RequireAuth>,
      },
    ],
  },
  { path: '/login', element: <LoginPage /> },
]);
