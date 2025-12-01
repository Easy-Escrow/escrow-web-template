import { createBrowserRouter } from 'react-router-dom';

import App from '../App';
import { RequireAuth } from '@/auth/components/RequireAuth';
import { DashboardPage } from '@/components/DashboardPage';
import { LoginPage } from '@/components/LoginPage';
import { SettingsPage } from '@/components/SettingsPage';
import { BrokerEscrowsPage } from '@/components/BrokerEscrowsPage';
import { EscrowWizardPage } from '@/components/EscrowWizardPage';
import { EscrowDetailPage } from '@/components/EscrowDetailPage';
import { CoBrokerInvitationsPage } from '@/components/CoBrokerInvitationsPage';

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
