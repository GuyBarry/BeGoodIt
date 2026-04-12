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
  { id: 'closet',   icon: <CheckroomIcon />,  label: 'Closet' },
  { id: 'add',      icon: <AddIcon />,         label: 'Add' },
  { id: 'fitting',  icon: <AutoAwesomeIcon />, label: 'Try On' },
  { id: 'smartbuy', icon: <ShoppingBagIcon />, label: 'Smart Buy' },
  { id: 'profile',  icon: <PersonIcon />,       label: 'Profile' },
];

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
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
          value={activeTab}
          onChange={(_, newValue: string) => onTabChange(newValue)}
          showLabels
          sx={{
            bgcolor: 'transparent',
            height: 64,
            '& .MuiBottomNavigationAction-root': {
              color: 'text.secondary',
              minWidth: 'auto',
              px: 1,
              transition: 'color 0.2s ease',
              '&.Mui-selected': {
                color: 'primary.main',
              },
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
              key={item.id}
              value={item.id}
              label={item.label}
              icon={
                <Box
                  sx={{
                    p: 0.75,
                    borderRadius: '50%',
                    bgcolor: activeTab === item.id ? 'primary.main' + '1a' : 'transparent',
                    transition: 'background-color 0.2s ease',
                    display: 'flex',
                    '& .MuiSvgIcon-root': {
                      fontSize: 22,
                      transform: activeTab === item.id ? 'scale(1.1)' : 'scale(1)',
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
