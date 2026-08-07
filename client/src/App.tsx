import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Box, CircularProgress, useMediaQuery, useTheme } from '@mui/material';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import ClosetScreen from './components/screens/ClosetScreen';
import AddItemScreen from './components/screens/AddItemScreen/index';
import FittingRoomScreen from './components/screens/FittingRoomScreen/index';
import SmartBuyScreen from './components/screens/SmartBuyScreen';
import ProfileScreen from './components/screens/ProfileScreen/index';
import BodyImageScreen from './components/screens/BodyImageScreen/index';
import VirtualModelOnboardingDialog from './components/screens/BodyImageScreen/VirtualModelOnboardingDialog';
import LoginScreen from './components/screens/LoginScreen/index';
import { useAuth } from './auth/AuthContext';

export default function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, isInitialized } = useAuth();
  const location = useLocation();

  if (!isInitialized) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    if (location.pathname !== '/login') {
      return <Navigate to="/login" replace />;
    }
    return (
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
      {!isMobile && <Sidebar />}

      <Box component="main" sx={{ flex: 1, minHeight: 0, overflow: 'hidden', pb: isMobile ? 8 : 0 }}>
        <Routes>
          <Route index element={<Navigate to="/fitting" replace />} />
          <Route path="/login"    element={<Navigate to="/fitting" replace />} />
          <Route path="/closet"   element={<ClosetScreen />} />
          <Route path="/add"      element={<AddItemScreen />} />
          <Route path="/fitting"  element={<FittingRoomScreen />} />
          <Route path="/smartbuy" element={<SmartBuyScreen />} />
          <Route path="/profile"  element={<ProfileScreen />} />
          <Route path="/body"     element={<BodyImageScreen />} />
          <Route path="*"         element={<Navigate to="/fitting" replace />} />
        </Routes>
      </Box>

      {isMobile && <BottomNav />}

      <VirtualModelOnboardingDialog />
    </Box>
  );
}
