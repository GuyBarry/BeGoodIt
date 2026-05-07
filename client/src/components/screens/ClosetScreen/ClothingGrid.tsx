import { Box, Typography, IconButton } from '@mui/material';
import { alpha } from '@mui/material/styles';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import type { ClothingItem } from '../../../entities/clothingItem';
import { imagesApi } from '../../../api/api/images.api';

interface Props {
  items: ClothingItem[];
  gridSize: 'normal' | 'compact';
  onDelete: (id: ClothingItem['id']) => void;
}

const gridCols = {
  normal:  { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)', xl: 'repeat(5, 1fr)' },
  compact: { xs: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(6, 1fr)', xl: 'repeat(8, 1fr)' },
};

export default function ClothingGrid({ items, gridSize, onDelete }: Props) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: gridCols[gridSize], gap: 3 }}>
      {items.map(item => {
        const displayName = item.style || item.category?.name || 'Item';
        const categoryName = item.category?.name ?? '';
        const seasonName   = item.season?.name ?? '';

        return (
          <Box
            key={item.id}
            sx={{
              position: 'relative',
              bgcolor: 'background.paper',
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '& .card-overlay': { opacity: 0, transition: 'opacity 0.3s' },
              '& .card-info':    { transform: 'translateY(100%)', transition: 'transform 0.3s' },
              '& .delete-btn':   { opacity: 0, transition: 'opacity 0.3s' },
              '& img':           { transition: 'transform 0.5s' },
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
                '& .card-overlay': { opacity: 1 },
                '& .card-info':    { transform: 'translateY(0)' },
                '& .delete-btn':   { opacity: 1 },
                '& img':           { transform: 'scale(1.05)' },
              },
            }}
          >
            <Box sx={{ aspectRatio: '3/4', overflow: 'hidden', bgcolor: '#fff' }}>
              <Box
                component="img"
                src={imagesApi.getImageUrl(item.imageId)}
                alt={displayName}
                sx={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
              />
            </Box>

            <Box
              className="card-overlay"
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent 60%)',
                pointerEvents: 'none',
              }}
            />

            <Box
              className="card-info"
              sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 1.5 }}
            >
              <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {displayName}
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: 11 }}>
                {categoryName}
              </Typography>
            </Box>

            <IconButton
              className="delete-btn"
              size="small"
              onClick={() => onDelete(item.id)}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: alpha('#fff', 0.85),
                backdropFilter: 'blur(4px)',
                color: 'error.main',
                '&:hover': { bgcolor: 'error.main', color: '#fff' },
              }}
            >
              <DeleteOutlinedIcon fontSize="small" />
            </IconButton>

            {seasonName && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  bgcolor: alpha('#fff', 0.85),
                  backdropFilter: 'blur(4px)',
                }}
              >
                <Typography sx={{ fontSize: 11, fontWeight: 500 }}>{seasonName}</Typography>
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
