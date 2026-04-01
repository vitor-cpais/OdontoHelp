import { AppBar, Box, Toolbar, Typography, IconButton, Breadcrumbs, Link, useTheme, useMediaQuery } from '@mui/material';
import { NotificationsOutlined, HelpOutlineOutlined, MenuOutlined } from '@mui/icons-material';
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

// Interface para receber a função de abrir o menu
interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const { pathname } = useLocation();

  const segments = pathname.split('/').filter(Boolean);
  const crumbs = segments.map((seg, i) => ({
    label: routeLabels[seg] ?? seg,
    path: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }));

  const pageTitle = crumbs.length > 0 ? crumbs[crumbs.length - 1].label : 'Dashboard';

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        // AQUI ESTÁ O SEGREDO: No iPad (mobile), o left é 0. No PC, pula a Sidebar.
        left: { xs: 0, lg: SIDEBAR_WIDTH },
        width: { xs: '100%', lg: `calc(100% - ${SIDEBAR_WIDTH}px)` },
        backgroundColor: 'background.default',
        borderBottom: '1px solid',
        borderColor: 'divider',
        zIndex: 99,
      }}
    >
      <Toolbar sx={{ minHeight: '56px !important', px: { xs: 2, sm: 3 }, justifyContent: 'space-between' }}>
        
        {/* Left: Hamburger + title + breadcrumbs */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          
          {/* Botão Hambúrguer: Só aparece no iPad/Mobile */}
          {isMobile && (
            <IconButton 
              onClick={onMenuClick}
              edge="start"
              sx={{ color: 'text.secondary', mr: 0.5 }}
            >
              <MenuOutlined />
            </IconButton>
          )}

          <Box>
            <Typography variant="h5" sx={{ 
              color: 'text.primary', 
              lineHeight: 1.2,
              fontSize: { xs: '1.1rem', sm: '1.5rem' } // Título menor no iPad/celular
            }}>
              {pageTitle}
            </Typography>
            
            {/* Esconde breadcrumbs em telas muito pequenas (iPhone), mas mantém no iPad */}
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
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
          </Box>
        </Box>

        {/* Right: actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton size="small" sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'inline-flex' } }}>
            <HelpOutlineOutlined sx={{ fontSize: 19 }} />
          </IconButton>
          <IconButton size="small" sx={{ color: 'text.secondary' }}>
            <NotificationsOutlined sx={{ fontSize: 19 }} />
          </IconButton>
          
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