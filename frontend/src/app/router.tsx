import { createBrowserRouter } from 'react-router-dom';

import App from '../App';
import { RequireAuth } from '@/auth/components/RequireAuth';
import { DashboardPage } from '@/escrows/pages/DashboardPage';
import { LoginPage } from '@/components/LoginPage';
import { SettingsPage } from '@/escrows/pages/SettingsPage';
import { BrokerEscrowsPage } from '@/escrows/pages/BrokerEscrowsPage';
import { EscrowWizardPage } from '@/escrows/pages/EscrowWizardPage';
import { EscrowDetailPage } from '@/escrows/pages/EscrowDetailPage';
import { CoBrokerInvitationsPage } from '@/escrows/pages/CoBrokerInvitationsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <RequireAuth><DashboardPage /></RequireAuth> },
      {
        path: 'broker/escrows',
        element: <RequireAuth><BrokerEscrowsPage /></RequireAuth>,
      },
      {
        path: 'broker/escrows/new',
        element: <RequireAuth><EscrowWizardPage /></RequireAuth>,
      },
      {
        path: 'broker/escrows/:id',
        element: <RequireAuth><EscrowDetailPage /></RequireAuth>,
      },
      {
        path: 'co-broker/invitations',
        element: <RequireAuth><CoBrokerInvitationsPage /></RequireAuth>,
      },
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
