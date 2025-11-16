import { createBrowserRouter } from 'react-router-dom';

import App from '../App';
import { DashboardPage } from '../components/DashboardPage';
import { SettingsPage } from '../components/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
]);
