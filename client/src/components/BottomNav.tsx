import { useNavigate, useLocation } from 'react-router-dom';
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Box,
} from '@mui/material';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PersonIcon from '@mui/icons-material/Person';

const navItems = [
  { path: '/closet',   icon: <CheckroomIcon />,  label: 'Closet' },
  { path: '/add',      icon: <AddIcon />,         label: 'Add' },
  { path: '/fitting',  icon: <AutoAwesomeIcon />, label: 'Try On' },
  { path: '/smartbuy', icon: <ShoppingBagIcon />, label: 'Smart Buy' },
  { path: '/profile',  icon: <PersonIcon />,       label: 'Profile' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        borderTop: '1px solid',
        borderColor: 'divider',
        backdropFilter: 'blur(20px)',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ maxWidth: 480, mx: 'auto' }}>
        <BottomNavigation
          value={pathname}
          onChange={(_, newPath: string) => navigate(newPath)}
          showLabels
          sx={{
            bgcolor: 'transparent',
            height: 64,
            '& .MuiBottomNavigationAction-root': {
              color: 'text.secondary',
              minWidth: 'auto',
              px: 1,
              transition: 'color 0.2s ease',
              '&.Mui-selected': { color: 'primary.main' },
              '& .MuiBottomNavigationAction-label': {
                fontSize: 10,
                fontWeight: 500,
                '&.Mui-selected': { fontWeight: 600, fontSize: 10 },
              },
            },
          }}
        >
          {navItems.map((item) => (
            <BottomNavigationAction
              key={item.path}
              value={item.path}
              label={item.label}
              icon={
                <Box
                  sx={{
                    p: 0.75,
                    borderRadius: '50%',
                    bgcolor: pathname === item.path ? 'rgba(200,100,50,0.1)' : 'transparent',
                    transition: 'background-color 0.2s ease',
                    display: 'flex',
                    '& .MuiSvgIcon-root': {
                      fontSize: 22,
                      transform: pathname === item.path ? 'scale(1.1)' : 'scale(1)',
                      transition: 'transform 0.2s ease',
                    },
                  }}
                >
                  {item.icon}
                </Box>
              }
            />
          ))}
        </BottomNavigation>
      </Box>
    </Paper>
  );
}
