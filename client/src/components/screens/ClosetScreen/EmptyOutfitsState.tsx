import { Box, Typography, Button } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AddIcon from '@mui/icons-material/Add';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import { useNavigate } from 'react-router-dom';
import { GRADIENTS, PALETTE, SERIF_FONT } from '../../../styles/tokens';

interface Props {
  hasClothes: boolean;
  hasBodyImage: boolean;
}

export default function EmptyOutfitsState({ hasClothes, hasBodyImage }: Props) {
  const navigate = useNavigate();

  const content = !hasClothes
    ? {
        title: 'Nothing hanging in this gallery yet',
        subtitle: "Outfits start with clothes. Add a few pieces and we'll take it from there.",
        buttonLabel: 'Add Your First Item',
        buttonIcon: <AddIcon />,
        onClick: () => navigate('/add'),
      }
    : !hasBodyImage
      ? {
          title: 'So close to your first outfit',
          subtitle: "You've got the clothes — now add a body photo so we can show you wearing them.",
          buttonLabel: 'Add Body Photo',
          buttonIcon: <PhotoCameraIcon />,
          onClick: () => navigate('/profile'),
        }
      : {
          title: 'Your outfit gallery is waiting',
          subtitle: 'Head to the Fitting Room, mix and match, and save your first look.',
          buttonLabel: 'Go to Fitting Room',
          buttonIcon: <CheckroomIcon />,
          onClick: () => navigate('/fitting'),
        };

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
        <AutoAwesomeIcon sx={{ fontSize: 36, color: PALETTE.primary }} />
      </Box>

      <Typography sx={{ fontFamily: SERIF_FONT, fontSize: 26, fontWeight: 600 }}>
        {content.title}
      </Typography>

      <Typography color="text.secondary" sx={{ maxWidth: 380 }}>
        {content.subtitle}
      </Typography>

      <Button
        variant="contained"
        startIcon={content.buttonIcon}
        onClick={content.onClick}
        sx={{
          mt: 1,
          borderRadius: 2.5,
          textTransform: 'none',
          fontWeight: 600,
          px: 3,
          background: GRADIENTS.primary,
        }}
      >
        {content.buttonLabel}
      </Button>
    </Box>
  );
}
