import { useState } from 'react';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';

function App() {
  const [activeTab, setActiveTab] = useState('closet');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {!isMobile && (
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      )}

      <Box
        component="main"
        sx={{
          flex: 1,
          overflow: 'auto',
          pb: isMobile ? 8 : 0,
          p: 4,
        }}
      >
        <Typography variant="h4" fontWeight={600} gutterBottom>
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        </Typography>
        <Typography color="text.secondary">
          Active tab: <strong>{activeTab}</strong>
        </Typography>
      </Box>

      {isMobile && (
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      )}
    </Box>
  );
}

export default App;
