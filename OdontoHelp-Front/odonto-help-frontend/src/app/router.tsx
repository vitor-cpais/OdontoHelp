// src/app/router.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppShell from '../shared/components/AppShell';
import { PrivateRoute, RoleRoute } from '../shared/components/RouteGuards';
import LoginPage from '../features/auth/LoginPage';

import AgendamentosPage  from '../features/agendamentos/pages/AgendamentosPage';
import DashboardPage     from '../features/dashboard/pages/DashboardPage';
import DentistasPage     from '../features/dentistas/pages/DentistasPage';
import PacientesPage     from '../features/pacientes/pages/PacientesPage';
import UsuariosPage      from '../features/usuarios/pages/UsuariosPage';
import ProcedimentosPage from '../features/procedimentos/pages/ProcedimentosPage';
import AtendimentosPage  from '../features/atendimentos/pages/AtendimentosPage';

const router = createBrowserRouter([
  // ─── pública ────────────────────────────────────────────────────────────────
  { path: '/login', element: <LoginPage /> },

  // ─── protegidas ─────────────────────────────────────────────────────────────
  {
    element: <PrivateRoute />,
    children: [
      {
        path: '/',
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },

          // ADMIN + RECEPCAO
          {
            element: <RoleRoute allowed={['ADMIN', 'RECEPCAO']} />,
            children: [
              { path: 'dashboard', element: <DashboardPage /> },
              { path: 'dentistas', element: <DentistasPage /> },
            ],
          },

          // ADMIN + RECEPCAO + DENTISTA
          {
            element: <RoleRoute allowed={['ADMIN', 'RECEPCAO', 'DENTISTA']} />,
            children: [
              { path: 'agendamentos',   element: <AgendamentosPage /> },
              { path: 'pacientes',      element: <PacientesPage /> },
              { path: 'procedimentos',  element: <ProcedimentosPage /> },
            ],
          },

          // ADMIN + DENTISTA (módulo clínico)
          {
            element: <RoleRoute allowed={['ADMIN', 'DENTISTA']} />,
            children: [
              { path: 'atendimentos', element: <AtendimentosPage /> },
            ],
          },

          // ADMIN only
          {
            element: <RoleRoute allowed={['ADMIN']} />,
            children: [
              { path: 'usuarios', element: <UsuariosPage /> },
            ],
          },
        ],
      },
    ],
  },

  // ─── fallback ────────────────────────────────────────────────────────────────
  { path: '*', element: <Navigate to="/" replace /> },
]);

export default router;
