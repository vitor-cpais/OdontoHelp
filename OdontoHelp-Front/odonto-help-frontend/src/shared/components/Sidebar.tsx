// src/shared/components/Sidebar.tsx
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  CalendarMonthOutlined,
  PeopleOutlined,
  MedicalServicesOutlined,
  DashboardOutlined,
  PersonOutlined,
  LogoutOutlined,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore, type PerfilUsuario } from '../store/authStore';
import { useLogout } from '../../features/auth/useAuth';

export const SIDEBAR_WIDTH = 220;

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  allowed: PerfilUsuario[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    icon: <DashboardOutlined sx={{ fontSize: 18 }} />,
    path: '/dashboard',
    allowed: ['ADMIN', 'RECEPCAO'],
  },
  {
    label: 'Agendamentos',
    icon: <CalendarMonthOutlined sx={{ fontSize: 18 }} />,
    path: '/agendamentos',
    allowed: ['ADMIN', 'RECEPCAO', 'DENTISTA'],
  },
  {
    label: 'Pacientes',
    icon: <PeopleOutlined sx={{ fontSize: 18 }} />,
    path: '/pacientes',
    allowed: ['ADMIN', 'RECEPCAO', 'DENTISTA'],
  },
  {
    label: 'Dentistas',
    icon: <MedicalServicesOutlined sx={{ fontSize: 18 }} />,
    path: '/dentistas',
    allowed: ['ADMIN', 'RECEPCAO'],
  },
  {
    label: 'Usuários',
    icon: <PersonOutlined sx={{ fontSize: 18 }} />,
    path: '/usuarios',
    allowed: ['ADMIN'],
  },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const perfil = useAuthStore((s) => s.usuario?.perfil);
  const logout = useLogout();

  const visibleItems = navItems.filter(
    (item) => perfil && item.allowed.includes(perfil)
  );

  const SidebarContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', gap: 1.25, height: 56 }}>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: '7px',
            backgroundColor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <MedicalServicesOutlined sx={{ fontSize: 15, color: '#fff' }} />
        </Box>
        <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.9rem' }}>
          OdontoHelp
        </Typography>
      </Box>

      <Divider />

      {/* Nav */}
      <Box sx={{ flex: 1, py: 1.5, overflowY: 'auto' }}>
        <Typography
          variant="overline"
          sx={{ px: 2.5, mb: 0.5, display: 'block', color: 'text.disabled', lineHeight: 1 }}
        >
          Menu
        </Typography>
        <List dense disablePadding>
          {visibleItems.map((item) => {
            const active =
              location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <ListItem key={item.path} disablePadding sx={{ px: 1.5, mb: 0.25 }}>
                <ListItemButton
                  onClick={() => {
                    navigate(item.path);
                    if (isMobile && onClose) onClose();
                  }}
                  selected={active}
                  sx={{
                    borderRadius: 1.5,
                    py: 1.1,
                    px: 1.25,
                    color: active ? 'primary.main' : 'text.secondary',
                    '&.Mui-selected': {
                      backgroundColor: '#E1F5EE',
                      color: 'primary.main',
                      '&:hover': { backgroundColor: '#d0eee3' },
                    },
                    '&:hover': { backgroundColor: 'action.hover' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.865rem',
                      fontWeight: active ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Divider />

      {/* Logout */}
      <List dense disablePadding sx={{ px: 1.5, py: 0.75 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            sx={{
              borderRadius: 1.5,
              py: 1.1,
              px: 1.25,
              color: 'error.main',
              '&:hover': { backgroundColor: 'action.hover' },
            }}
          >
            <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
              <LogoutOutlined sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText
              primary="Sair"
              primaryTypographyProps={{ fontSize: '0.865rem', fontWeight: 400 }}
            />
          </ListItemButton>
        </ListItem>
      </List>

      {/* Rodapé */}
      <Divider />
      <Box sx={{ px: 2.5, py: 1.75 }}>
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
          v0..0 • OdontoHelp © 2026
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { lg: SIDEBAR_WIDTH }, flexShrink: { lg: 0 } }}>
      {/* Mobile/iPad: Temporária */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: SIDEBAR_WIDTH },
        }}
      >
        {SidebarContent}
      </Drawer>

      {/* Desktop: Fixa */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', lg: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: SIDEBAR_WIDTH,
            borderRight: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
          },
        }}
        open
      >
        {SidebarContent}
      </Drawer>
    </Box>
  );
}
