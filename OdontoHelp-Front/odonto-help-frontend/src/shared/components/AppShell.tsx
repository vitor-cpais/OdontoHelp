import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar, { SIDEBAR_WIDTH } from './Sidebar';
import Header from './Header';

export default function AppShell() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: `${SIDEBAR_WIDTH}px`,
          mt: '56px',
          minHeight: 'calc(100vh - 56px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Header />
        <Box sx={{ flex: 1, p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
