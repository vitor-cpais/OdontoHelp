import { AppBar, Box, Toolbar, Typography, IconButton, Breadcrumbs, Link } from '@mui/material';
import { NotificationsOutlined, HelpOutlineOutlined } from '@mui/icons-material';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import { SIDEBAR_WIDTH } from './Sidebar';

const routeLabels: Record<string, string> = {
  '': 'Dashboard',
  agendamentos: 'Agendamentos',
  pacientes: 'Pacientes',
  dentistas: 'Dentistas',
  usuarios: 'Usuários',
  novo: 'Novo',
  editar: 'Editar',
};

function useBreadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);
  return segments.map((seg, i) => ({
    label: routeLabels[seg] ?? seg,
    path: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }));
}

export default function Header() {
  const crumbs = useBreadcrumbs();
  const { pathname } = useLocation();

  const pageTitle =
    crumbs.length > 0
      ? crumbs[crumbs.length - 1].label
      : 'Dashboard';

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        left: SIDEBAR_WIDTH,
        width: `calc(100% - ${SIDEBAR_WIDTH}px)`,
        backgroundColor: 'background.default',
        borderBottom: '1px solid',
        borderColor: 'divider',
        zIndex: 99,
      }}
    >
      <Toolbar sx={{ minHeight: '56px !important', px: 3, justifyContent: 'space-between' }}>
        {/* Left: title + breadcrumbs */}
        <Box>
          <Typography variant="h5" sx={{ color: 'text.primary', lineHeight: 1.2 }}>
            {pageTitle}
          </Typography>
          {crumbs.length > 0 && (
            <Breadcrumbs separator="/" sx={{ mt: 0.15 }}>
              <Link component={RouterLink} to="/" underline="hover" sx={{ fontSize: '0.72rem', color: 'text.disabled' }}>
                Início
              </Link>
              {crumbs.map((c) =>
                c.isLast ? (
                  <Typography key={c.path} sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
                    {c.label}
                  </Typography>
                ) : (
                  <Link key={c.path} component={RouterLink} to={c.path} underline="hover" sx={{ fontSize: '0.72rem', color: 'text.disabled' }}>
                    {c.label}
                  </Link>
                )
              )}
            </Breadcrumbs>
          )}
        </Box>

        {/* Right: actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton size="small" sx={{ color: 'text.secondary' }}>
            <HelpOutlineOutlined sx={{ fontSize: 19 }} />
          </IconButton>
          <IconButton size="small" sx={{ color: 'text.secondary' }}>
            <NotificationsOutlined sx={{ fontSize: 19 }} />
          </IconButton>
          {/* Avatar placeholder — será substituído pelo usuário logado no MVP 1.5 */}
          <Box
            sx={{
              ml: 1,
              width: 30,
              height: 30,
              borderRadius: '50%',
              backgroundColor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#fff' }}>A</Typography>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
