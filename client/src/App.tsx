import { Navigate, Route, Routes } from 'react-router-dom';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import ClosetScreen from './components/screens/ClosetScreen';
import AddItemScreen from './components/screens/AddItemScreen/index';
import FittingRoomScreen from './components/screens/FittingRoomScreen/index';
import SmartBuyScreen from './components/screens/SmartBuyScreen';
import ProfileScreen from './components/screens/ProfileScreen/index';

export default function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {!isMobile && <Sidebar />}

      <Box component="main" sx={{ flex: 1, overflow: 'auto', pb: isMobile ? 8 : 0 }}>
        <Routes>
          <Route index element={<Navigate to="/fitting" replace />} />
          <Route path="/closet"   element={<ClosetScreen />} />
          <Route path="/add"      element={<AddItemScreen />} />
          <Route path="/fitting"  element={<FittingRoomScreen />} />
          <Route path="/smartbuy" element={<SmartBuyScreen />} />
          <Route path="/profile"  element={<ProfileScreen />} />
          <Route path="*"         element={<Navigate to="/fitting" replace />} />
        </Routes>
      </Box>

      {isMobile && <BottomNav />}
    </Box>
  );
}
