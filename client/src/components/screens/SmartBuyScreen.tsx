import { Box, Typography } from '@mui/material';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';

export default function SmartBuyScreen() {
  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <ShoppingBagIcon sx={{ color: 'primary.main', fontSize: 32 }} />
        <Typography variant="h4" sx={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 600 }}>
          Smart Buy
        </Typography>
      </Box>
      <Typography color="text.secondary">Test before buying — coming soon.</Typography>
    </Box>
  );
}
