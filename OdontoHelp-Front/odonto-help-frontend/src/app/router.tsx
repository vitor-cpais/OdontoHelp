import { createBrowserRouter } from 'react-router-dom';
import AppShell from '../shared/components/AppShell';

// Páginas — serão criadas nas próximas entregas


import AgendamentosPage from '../features/agendamentos/pages/AgendamentosPage';
import DashboardPage from '../features/dashboard/DashboardPage';
import DentistasPage from '../features/dentistas/pages/DentistasPage';
import PacientesPage from '../features/pacientes/pages/PacientesPage';
import UsuariosPage from '../features/usuarios/pages/UsuariosPage';


const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },

      // Usuários (pacientes + dentistas)
      { path: 'usuarios', element: <UsuariosPage /> },
     // { path: 'usuarios/novo', element: <UsuarioFormPage /> },
    //  { path: 'usuarios/:id/editar', element: <UsuarioFormPage /> },

      // Agendamentos
      { path: 'agendamentos', element: <AgendamentosPage /> },

      // Pacientes (listagem rápida)
      { path: 'pacientes', element: <PacientesPage /> },

      // Dentistas (listagem rápida)
      { path: 'dentistas', element: <DentistasPage /> },
    ],
  },
]);

export default router;
