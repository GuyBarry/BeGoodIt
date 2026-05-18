import { Box, Typography, Dialog, DialogContent, DialogTitle, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { SERIF_FONT } from '../../../styles/tokens';
import type { Outfit } from '../../../entities/outfit';
import { imagesApi } from '../../../api/api/images.api';

interface Props {
  outfit: Outfit | null;
  onClose: () => void;
}

export default function OutfitDialog({ outfit, onClose }: Props) {
  return (
    <Dialog
      open={!!outfit}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      <DialogTitle sx={{ fontFamily: SERIF_FONT, fontSize: 22, fontWeight: 600, pb: 1 }}>
        {outfit?.name ?? 'Outfit'}
      </DialogTitle>
      <DialogContent>
        {outfit && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ aspectRatio: '4/3', borderRadius: 3, overflow: 'hidden', bgcolor: 'grey.100' }}>
              {outfit.imageId && (
                <Box
                  component="img"
                  src={imagesApi.getImageUrl(outfit.imageId)}
                  alt={outfit.name ?? 'Outfit'}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              )}
            </Box>

            {(outfit.items ?? []).length > 0 && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Clothing Items in This Outfit
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                  {(outfit.items ?? []).map(item => {
                    const label = item.style || item.category?.name || 'Item';
                    return (
                      <Box key={item.id}>
                        <Box sx={{ aspectRatio: '3/4', borderRadius: 2, overflow: 'hidden', bgcolor: '#fff', mb: 1 }}>
                          {item.imageId && (
                            <Box
                              component="img"
                              src={imagesApi.getImageUrl(item.imageId)}
                              alt={label}
                              sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            />
                          )}
                        </Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                          {label}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}

            <Button
              variant="outlined"
              fullWidth
              startIcon={<CloseIcon />}
              onClick={onClose}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 500 }}
            >
              Close
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
