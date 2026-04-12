import { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Typography,
  Divider,
  Tooltip,
} from '@mui/material';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PersonIcon from '@mui/icons-material/Person';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const DRAWER_WIDTH = 272;
const DRAWER_COLLAPSED_WIDTH = 80;
const TRANSITION = 'cubic-bezier(0.4, 0, 0.2, 1)';
const DURATION = '0.3s';

export interface NavItem {
  id: string;
  icon: React.ReactElement;
  label: string;
  description: string;
}

const navItems: NavItem[] = [
  { id: 'closet',   icon: <CheckroomIcon />,  label: 'My Closet',    description: 'Browse your wardrobe' },
  { id: 'add',      icon: <AddIcon />,         label: 'Add Item',     description: 'Upload new clothes' },
  { id: 'fitting',  icon: <AutoAwesomeIcon />, label: 'Fitting Room', description: 'Create outfits' },
  { id: 'smartbuy', icon: <ShoppingBagIcon />, label: 'Smart Buy',    description: 'Test before buying' },
  { id: 'profile',  icon: <PersonIcon />,       label: 'Profile',      description: 'Your stats & settings' },
];

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const width = collapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        transition: `width ${DURATION} ${TRANSITION}`,
        '& .MuiDrawer-paper': {
          width,
          overflowX: 'hidden',
          transition: `width ${DURATION} ${TRANSITION}`,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          px: 2,
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          minHeight: 72,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2.5,
            background: 'linear-gradient(135deg, #c86432 0%, #e8956d 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <CheckroomIcon sx={{ color: '#fff', fontSize: 20 }} />
        </Box>

        {/* Text fades and collapses smoothly */}
        <Box
          sx={{
            overflow: 'hidden',
            maxWidth: collapsed ? 0 : 180,
            opacity: collapsed ? 0 : 1,
            transition: `max-width ${DURATION} ${TRANSITION}, opacity 0.2s ease`,
            whiteSpace: 'nowrap',
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 600, lineHeight: 1.2 }}
          >
            BeGoodIt
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Smart Wardrobe
          </Typography>
        </Box>
      </Box>

      {/* Navigation */}
      <List sx={{ flex: 1, px: 1, py: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;

          const button = (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                selected={isActive}
                onClick={() => onTabChange(item.id)}
                sx={{
                  borderRadius: 2.5,
                  px: 1.5,
                  py: 1.5,
                  transition: `background-color 0.2s ease, box-shadow 0.2s ease`,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    boxShadow: '0 4px 12px rgba(200, 100, 50, 0.35)',
                    '&:hover': { bgcolor: 'primary.dark' },
                    '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                  },
                  '&:not(.Mui-selected)': {
                    color: 'text.secondary',
                    '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: 'inherit',
                    justifyContent: 'center',
                    '& .MuiSvgIcon-root': {
                      fontSize: 22,
                      transform: isActive ? 'scale(1.1)' : 'scale(1)',
                      transition: 'transform 0.2s ease',
                    },
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                {/* Label + description fade and collapse smoothly */}
                <Box
                  sx={{
                    overflow: 'hidden',
                    maxWidth: collapsed ? 0 : 180,
                    opacity: collapsed ? 0 : 1,
                    transition: `max-width ${DURATION} ${TRANSITION}, opacity 0.15s ease`,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Typography
                    component="p"
                    sx={{ fontWeight: 500, fontSize: 14, lineHeight: 1.3 }}
                  >
                    {item.label}
                  </Typography>
                  <Typography
                    component="p"
                    sx={{
                      fontSize: 11,
                      lineHeight: 1.3,
                      opacity: isActive ? 0.75 : 1,
                      color: isActive ? 'primary.contrastText' : 'text.secondary',
                    }}
                  >
                    {item.description}
                  </Typography>
                </Box>
              </ListItemButton>
            </ListItem>
          );

          return collapsed ? (
            <Tooltip key={item.id} title={item.label} placement="right">
              {button}
            </Tooltip>
          ) : button;
        })}
      </List>

      {/* Collapse Toggle */}
      <Divider />
      <Box sx={{ p: 1 }}>
        <ListItemButton
          onClick={() => setCollapsed((prev) => !prev)}
          sx={{
            borderRadius: 2.5,
            px: 1.5,
            py: 1.25,
            color: 'text.secondary',
            transition: 'background-color 0.2s ease',
            '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: 'inherit', justifyContent: 'center' }}>
            <Box
              sx={{
                display: 'flex',
                transition: `transform ${DURATION} ${TRANSITION}`,
                transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)',
              }}
            >
              <ChevronRightIcon />
            </Box>
          </ListItemIcon>

          <Box
            sx={{
              overflow: 'hidden',
              maxWidth: collapsed ? 0 : 180,
              opacity: collapsed ? 0 : 1,
              transition: `max-width ${DURATION} ${TRANSITION}, opacity 0.15s ease`,
              whiteSpace: 'nowrap',
            }}
          >
            <Typography sx={{ fontSize: 14 }}>Collapse</Typography>
          </Box>
        </ListItemButton>
      </Box>
    </Drawer>
  );
}
