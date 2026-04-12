import { Box, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

export default function AddItemScreen() {
  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <AddIcon sx={{ color: 'primary.main', fontSize: 32 }} />
        <Typography variant="h4" sx={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 600 }}>
          Add Item
        </Typography>
      </Box>
      <Typography color="text.secondary">Upload new clothes — coming soon.</Typography>
    </Box>
  );
}
