import { useState } from 'react'; // 1. Faltou importar o useState
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar, { SIDEBAR_WIDTH } from './Sidebar';
import Header from './Header';

export default function AppShell() {
  // 2. Criar o estado para o menu
  const [mobileOpen, setMobileOpen] = useState(false);

  // 3. Função para inverter o estado (abrir/fechar)
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      
      {/* 4. Passar as props para a Sidebar (senão ela vai dar erro logo em seguida) */}
      <Sidebar mobileOpen={mobileOpen} onClose={handleDrawerToggle} />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          // 5. IMPORTANTE: No iPad (xs/md) a margem é 0. No PC (lg) ela é 220px.
          ml: { xs: 0, lg: `${SIDEBAR_WIDTH}px` }, 
          mt: '56px',
          minHeight: 'calc(100vh - 56px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 6. AQUI RESOLVE O ERRO DA FOTO: Passar a prop onMenuClick */}
        <Header onMenuClick={handleDrawerToggle} />
        
        <Box sx={{ flex: 1, p: { xs: 2, sm: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}