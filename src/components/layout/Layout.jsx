import { useState, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';
import ScrollToTop from '../common/ScrollToTop';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef(null);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          width: 0,
          overflow: 'hidden',
        }}
      >
        <Header onMenuClick={() => setSidebarOpen(true)} />
        {/* Non-scrolling wrapper — holds progress bar + FAB */}
        <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <ScrollToTop scrollRef={scrollRef} />
          {/* Scrollable content */}
          <Box
            ref={scrollRef}
            sx={{
              height: '100%',
              overflow: 'auto',
              p: { xs: 1.5, sm: 2, md: 4 },
              maxWidth: 1200,
              width: '100%',
              mx: 'auto',
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
