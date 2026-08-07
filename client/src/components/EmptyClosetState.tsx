import { Box, Typography, Button } from '@mui/material';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { GRADIENTS, PALETTE, SERIF_FONT } from '../styles/tokens';

interface Props {
  title?: string;
  subtitle?: string;
}

export default function EmptyClosetState({
  title = 'Nothing to see here... literally',
  subtitle = "No clothes here yet. Add some pieces and let's build you a wardrobe worth bragging about.",
}: Props) {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 2,
        py: 8,
        px: 3,
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: GRADIENTS.primarySubtle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CheckroomIcon sx={{ fontSize: 36, color: PALETTE.primary }} />
      </Box>

      <Typography sx={{ fontFamily: SERIF_FONT, fontSize: 26, fontWeight: 600 }}>
        {title}
      </Typography>

      <Typography color="text.secondary" sx={{ maxWidth: 380 }}>
        {subtitle}
      </Typography>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => navigate('/add')}
        sx={{
          mt: 1,
          borderRadius: 2.5,
          textTransform: 'none',
          fontWeight: 600,
          px: 3,
          background: GRADIENTS.primary,
        }}
      >
        Add Your First Item
      </Button>
    </Box>
  );
}
