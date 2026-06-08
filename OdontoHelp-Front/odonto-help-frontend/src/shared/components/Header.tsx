// src/shared/components/Header.tsx
import {
  AppBar,
  Box,
  Breadcrumbs,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  NotificationsOutlined,
  HelpOutlineOutlined,
  MenuOutlined,
  LogoutOutlined,
  DarkModeOutlined,
  LightModeOutlined,
} from '@mui/icons-material';
import { useState } from 'react';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import { SIDEBAR_WIDTH } from './Sidebar';
import { useAuthStore } from '../store/authStore';
import { useUiPreferencesStore } from '../store/uiPreferencesStore';
import { useLogout } from '../../features/auth/useAuth';
import { useOnboardingStore } from '../store/onboardingStore';

const routeLabels: Record<string, string> = {
  '': 'Dashboard',
  agendamentos: 'Agendamentos',
  pacientes: 'Pacientes',
  dentistas: 'Dentistas',
  usuarios: 'Usuários',
  novo: 'Novo',
  editar: 'Editar',
};

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const { pathname } = useLocation();

  const usuario = useAuthStore((s) => s.usuario);
  const themeMode = useUiPreferencesStore((s) => s.themeMode);
  const toggleThemeMode = useUiPreferencesStore((s) => s.toggleThemeMode);
  const logout = useLogout();
  const openOnboarding = useOnboardingStore((s) => s.open);
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  // ── breadcrumb ──
  const segments = pathname.split('/').filter(Boolean);
  const crumbs = segments.map((seg, i) => ({
    label: routeLabels[seg] ?? seg,
    path: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }));
  const pageTitle = crumbs.length > 0 ? crumbs[crumbs.length - 1].label : 'Dashboard';

  // ── avatar: iniciais do nome ──
  const initials = usuario?.nome
    ? usuario.nome
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
    : '?';

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        left: { xs: 0, lg: SIDEBAR_WIDTH },
        width: { xs: '100%', lg: `calc(100% - ${SIDEBAR_WIDTH}px)` },
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(7,20,17,0.86)' : 'rgba(247,246,242,0.86)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid',
        borderColor: 'rgba(15,110,86,0.08)',
        zIndex: 99,
      }}
    >
      <Toolbar
        sx={{
          minHeight: '56px !important',
          px: { xs: 2, sm: 3 },
          justifyContent: 'space-between',
        }}
      >
        {/* Left: Hambúrguer + título + breadcrumb */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
            <Typography
              variant="h5"
              sx={{
                color: 'text.primary',
                lineHeight: 1.2,
                fontSize: { xs: '1.1rem', sm: '1.35rem' },
                fontWeight: 700,
                letterSpacing: '-0.03em',
              }}
            >
              {pageTitle}
            </Typography>

            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              {crumbs.length > 0 && (
                <Breadcrumbs separator="/" sx={{ mt: 0.15 }}>
                  <Link
                    component={RouterLink}
                    to="/dashboard"
                    underline="hover"
                    sx={{ fontSize: '0.72rem', color: 'text.disabled' }}
                  >
                    Início
                  </Link>
                  {crumbs.map((c) =>
                    c.isLast ? (
                      <Typography
                        key={c.path}
                        sx={{ fontSize: '0.72rem', color: 'text.secondary' }}
                      >
                        {c.label}
                      </Typography>
                    ) : (
                      <Link
                        key={c.path}
                        component={RouterLink}
                        to={c.path}
                        underline="hover"
                        sx={{ fontSize: '0.72rem', color: 'text.disabled' }}
                      >
                        {c.label}
                      </Link>
                    )
                  )}
                </Breadcrumbs>
              )}
            </Box>
          </Box>
        </Box>

        {/* Right: ações + avatar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={toggleThemeMode}
            sx={{ color: 'text.secondary' }}
          >
            {themeMode === 'dark'
              ? <LightModeOutlined sx={{ fontSize: 19 }} />
              : <DarkModeOutlined sx={{ fontSize: 19 }} />}
          </IconButton>

          <IconButton
            size="small"
            onClick={openOnboarding}
            aria-label="Abrir tutorial"
            sx={{ color: 'text.secondary' }}
          >
            <HelpOutlineOutlined sx={{ fontSize: 19 }} />
          </IconButton>

          <IconButton size="small" sx={{ color: 'text.secondary' }}>
            <NotificationsOutlined sx={{ fontSize: 19 }} />
          </IconButton>

          {/* Avatar com menu */}
          <Box
            onClick={(e) => setAnchor(e.currentTarget)}
            sx={{
              ml: 1,
              width: 30,
              height: 30,
              borderRadius: '50%',
              backgroundColor: 'primary.main',
              boxShadow: '0 8px 18px rgba(15,110,86,0.22)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#fff' }}>
              {initials}
            </Typography>
          </Box>

          <Menu
            anchorEl={anchor}
            open={Boolean(anchor)}
            onClose={() => setAnchor(null)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            slotProps={{ paper: { sx: { minWidth: 180, mt: 0.5 } } }}
          >
            {/* Info do usuário */}
            <MenuItem
              component="div"
              sx={{
                cursor: 'default',
                backgroundColor: 'transparent !important',
                '&:hover': { backgroundColor: 'transparent !important' }
              }}
            >
              <Box display="flex" flexDirection="column">
                <Typography variant="body2" fontWeight={600}>
                  Nome: {usuario?.nome ?? '—'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Email: {usuario?.email ?? '—'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Cargo: {usuario?.perfil ?? ''}
                </Typography>
              </Box>
            </MenuItem>

            <MenuItem
              onClick={() => {
                setAnchor(null);
                openOnboarding();
              }}
            >
              <HelpOutlineOutlined sx={{ fontSize: 17, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2">Tutorial</Typography>
            </MenuItem>

            <MenuItem
              onClick={() => {
                setAnchor(null);
                logout.mutate();
              }}
              disabled={logout.isPending}
            >
              <LogoutOutlined sx={{ fontSize: 17, mr: 1, color: 'error.main' }} />
              <Typography variant="body2" color="error">
                Sair
              </Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
