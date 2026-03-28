import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider } from '@mui/material';
import {
  CalendarMonthOutlined,
  PeopleOutlined,
  PersonOutlined,
  MedicalServicesOutlined,
  DashboardOutlined,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

const SIDEBAR_WIDTH = 220;

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: <DashboardOutlined sx={{ fontSize: 18 }} />, path: '/' },
  { label: 'Agendamentos', icon: <CalendarMonthOutlined sx={{ fontSize: 18 }} />, path: '/agendamentos' },
  { label: 'Pacientes', icon: <PeopleOutlined sx={{ fontSize: 18 }} />, path: '/pacientes' },
  { label: 'Dentistas', icon: <MedicalServicesOutlined sx={{ fontSize: 18 }} />, path: '/dentistas' },
  { label: 'Usuários', icon: <PersonOutlined sx={{ fontSize: 18 }} />, path: '/usuarios' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Box
      component="nav"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 100,
      }}
    >
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
        <Typography variant="overline" sx={{ px: 2.5, mb: 0.5, display: 'block', color: 'text.disabled' }}>
          Menu
        </Typography>
        <List dense disablePadding>
          {navItems.map((item) => {
            const active = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <ListItem key={item.path} disablePadding sx={{ px: 1.5, mb: 0.25 }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  selected={active}
                  sx={{
                    borderRadius: 1.5,
                    py: 0.85,
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
                    primaryTypographyProps={{ fontSize: '0.865rem', fontWeight: active ? 500 : 400 }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Footer */}
      <Divider />
      <Box sx={{ px: 2.5, py: 1.75 }}>
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
          MVP 1 · sem autenticação
        </Typography>
      </Box>
    </Box>
  );
}

export { SIDEBAR_WIDTH };
