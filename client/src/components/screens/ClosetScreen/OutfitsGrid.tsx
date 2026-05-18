import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import FavoriteIcon from '@mui/icons-material/Favorite';
import type { Outfit } from '../../../entities/outfit';
import { imagesApi } from '../../../api/api/images.api';

interface Props {
  outfits: Outfit[];
  gridSize: 'normal' | 'compact';
  onSelect: (outfit: Outfit) => void;
}

const gridCols = {
  normal:  { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
  compact: { xs: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(6, 1fr)' },
};

export default function OutfitsGrid({ outfits, gridSize, onSelect }: Props) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: gridCols[gridSize], gap: 3 }}>
      {outfits.map(outfit => (
        <Box
          key={outfit.id}
          component="button"
          onClick={() => onSelect(outfit)}
          sx={{
            position: 'relative',
            bgcolor: 'background.paper',
            borderRadius: 3,
            overflow: 'hidden',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            textAlign: 'left',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '& img': { transition: 'transform 0.5s' },
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
              '& img': { transform: 'scale(1.05)' },
            },
          }}
        >
          <Box sx={{ aspectRatio: '3/4', overflow: 'hidden' }}>
            {outfit.imageId ? (
              <Box
                component="img"
                src={imagesApi.getImageUrl(outfit.imageId)}
                alt={outfit.name ?? 'Outfit'}
                sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <Box sx={{ width: '100%', height: '100%', bgcolor: 'grey.100' }} />
            )}
          </Box>

          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              p: 1.5,
              background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
            }}
          >
            <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>
              {outfit.name ?? 'Outfit'}
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>
              {outfit.items?.length ?? 0} items
            </Typography>
          </Box>

          {outfit.isFavorite && (
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: alpha('#fff', 0.85),
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FavoriteIcon sx={{ fontSize: 18, color: 'primary.main' }} />
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
}
