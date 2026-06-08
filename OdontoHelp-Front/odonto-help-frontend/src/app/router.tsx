// src/app/router.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppShell from '../shared/components/AppShell';
import { NotFoundRedirect, PrivateRoute, RoleRoute } from '../shared/components/RouteGuards';
import LoginPage from '../features/auth/LoginPage';
import ForgotPasswordPage from '../features/auth/ForgotPasswordPage';
import ResetPasswordPage from '../features/auth/ResetPasswordPage';

import AgendamentosPage  from '../features/agendamentos/pages/AgendamentosPage';
import DashboardPage     from '../features/dashboard/pages/DashboardPage';
import DentistasPage     from '../features/dentistas/pages/DentistasPage';
import PacientesPage     from '../features/pacientes/pages/PacientesPage';
import PacienteHubPage   from '../features/pacientes/pages/PacienteHubPage';
import UsuariosPage      from '../features/usuarios/pages/UsuariosPage';
import ProcedimentosPage from '../features/procedimentos/pages/ProcedimentosPage';
import AtendimentosPage  from '../features/atendimentos/pages/AtendimentosPage';
import AtendimentoDetailPage from '../features/atendimentos/pages/AtendimentoDetailPage';
import FinanceiroPage from '../features/financeiro/pages/FinanceiroPage';

const router = createBrowserRouter([
  // ─── pública ────────────────────────────────────────────────────────────────
  { path: '/login', element: <LoginPage /> },
  { path: '/esqueci-senha', element: <ForgotPasswordPage /> },
  { path: '/resetar-senha', element: <ResetPasswordPage /> },

  // ─── protegidas ─────────────────────────────────────────────────────────────
  {
    element: <PrivateRoute />,
    children: [
      {
        path: '/',
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },

  
          // ADMIN + RECEPCAO + DENTISTA (agenda de consultas)
          {
            element: <RoleRoute allowed={['ADMIN', 'RECEPCAO', 'DENTISTA']} />,
            children: [
              { path: 'agendamentos', element: <AgendamentosPage /> },
              { path: 'pacientes',    element: <PacientesPage /> },
              { path: 'pacientes/:id',    element: <PacienteHubPage /> },
              { path: 'dashboard', element: <DashboardPage /> },
              { path: 'dentistas', element: <DentistasPage /> },
            ],
          },

          // ADMIN + RECEPCAO (financeiro)
          {
            element: <RoleRoute allowed={['ADMIN', 'RECEPCAO']} />,
            children: [
              { path: 'financeiro', element: <FinanceiroPage /> },
            ],
          },

          // ADMIN + DENTISTA (módulo clínico)
          {
            element: <RoleRoute allowed={['ADMIN', 'DENTISTA']} />,
            children: [
              { path: 'atendimentos', element: <AtendimentosPage /> },
              { path: 'atendimentos/:id', element: <AtendimentoDetailPage /> },
            ],
          },

          // ADMIN only (gestão de sistema)
          {
            element: <RoleRoute allowed={['ADMIN']} />,
            children: [
              { path: 'usuarios',     element: <UsuariosPage /> },
              { path: 'procedimentos', element: <ProcedimentosPage /> },
              { path: 'dentistas', element: <DentistasPage /> },
              { path: 'dentistas/:id', element: <DentistasPage /> },
            ],
          },

          { path: '*', element: <NotFoundRedirect /> },
        ],
      },
      { path: '*', element: <NotFoundRedirect /> },
    ],
  },

  // ─── fallback ────────────────────────────────────────────────────────────────
  { path: '*', element: <NotFoundRedirect /> },
]);

export default router;
