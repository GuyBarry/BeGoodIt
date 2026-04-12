import { useState } from 'react';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import FittingRoomScreen from './components/screens/FittingRoomScreen';

function renderScreen(tab: string) {
  switch (tab) {
    case 'fitting': return <FittingRoomScreen />;
    default:
      return (
        <Box sx={{ p: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, fontFamily: '"Cormorant Garamond", serif' }} gutterBottom>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Typography>
          <Typography color="text.secondary">Coming soon.</Typography>
        </Box>
      );
  }
}

function App() {
  const [activeTab, setActiveTab] = useState('fitting');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {!isMobile && (
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      )}

      <Box
        component="main"
        sx={{ flex: 1, overflow: 'auto', pb: isMobile ? 8 : 0 }}
      >
        {renderScreen(activeTab)}
      </Box>

      {isMobile && (
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      )}
    </Box>
  );
}

export default App;
