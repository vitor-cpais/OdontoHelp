import { useState } from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar, { SIDEBAR_WIDTH } from './Sidebar';
import Header from './Header';
import OnboardingDialog from '../../features/onboarding/OnboardingDialog';
import { useOnboardingAutoOpen } from '../../features/onboarding/useOnboarding';
import InstallPwaBanner from './InstallPwaBanner';

export default function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isOpen: onboardingOpen, close: closeOnboarding } = useOnboardingAutoOpen();

  // 3. Função para inverter o estado (abrir/fechar)
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'radial-gradient(circle at top left, rgba(29,158,117,0.12), transparent 30%), linear-gradient(180deg, #071411 0%, #0A1714 100%)'
            : 'radial-gradient(circle at top left, rgba(15,110,86,0.08), transparent 30%), linear-gradient(180deg, #F7F6F2 0%, #F2F0E9 100%)',
      }}
    >
      
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
        
        <Box
          sx={{
            flex: 1,
            p: { xs: 2, sm: 3 },
            pt: { xs: 'max(16px, env(safe-area-inset-top))', sm: 3 },
            pb: { xs: 'max(16px, env(safe-area-inset-bottom))', sm: 3 },
            maxWidth: 1440,
            width: '100%',
            mx: 'auto',
          }}
        >
          <InstallPwaBanner />
          <Outlet />
        </Box>
      </Box>

      <OnboardingDialog open={onboardingOpen} onClose={closeOnboarding} />
    </Box>
  );
}