import { Box, Typography, Dialog, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { GRADIENTS, SERIF_FONT } from '../../../styles/tokens';
import type { Outfit } from '../../../entities/outfit';
import { imagesApi } from '../../../api/api/images.api';

interface Props {
  outfit: Outfit | null;
  onClose: () => void;
}

export default function OutfitDialog({ outfit, onClose }: Props) {
  const items = outfit?.items ?? [];

  return (
    <Dialog
      open={!!outfit}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 4 } } }}
    >
      {outfit && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 3, pt: 3, pb: 1 }}>
            <Typography
              sx={{ flex: 1, fontFamily: SERIF_FONT, fontSize: 22, fontWeight: 600 }}
              noWrap
            >
              {outfit.name ?? 'Outfit'}
            </Typography>
            <IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <DialogContent sx={{ px: 3, pt: 1, pb: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
              <Box
                sx={{
                  flexShrink: 0,
                  width: { xs: '100%', sm: 260 },
                  aspectRatio: '3/4',
                  borderRadius: 3,
                  overflow: 'hidden',
                  background: GRADIENTS.primarySubtle,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                {outfit.imageId && (
                  <Box
                    component="img"
                    src={imagesApi.getImageUrl(outfit.imageId)}
                    alt={outfit.name ?? 'Outfit'}
                    sx={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                  />
                )}
              </Box>

              <Box
                sx={{
                  display: { xs: 'none', sm: 'block' },
                  width: '1px',
                  bgcolor: 'divider',
                  alignSelf: 'stretch',
                }}
              />

              {items.length > 0 && (
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600, mb: 0.25 }}>
                    Clothing Items in This Outfit
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </Typography>

                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 1.5,
                      maxHeight: { xs: 300, sm: 340 },
                      overflowY: 'auto',
                      pr: 1,
                    }}
                  >
                    {items.map(item => {
                      const label = item.styles?.join(', ') || item.category?.name || 'Item';
                      const categoryName = item.category?.name;
                      return (
                        <Box
                          key={item.id}
                          sx={{
                            width: 118,
                            borderRadius: 2.5,
                            border: '1px solid',
                            borderColor: 'divider',
                            bgcolor: 'background.paper',
                            overflow: 'hidden',
                            transition: 'box-shadow 0.2s, transform 0.2s',
                            '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)', transform: 'translateY(-2px)' },
                          }}
                        >
                          <Box sx={{ aspectRatio: '3/4', bgcolor: 'grey.50' }}>
                            {item.imageId && (
                              <Box
                                component="img"
                                src={imagesApi.getImageUrl(item.imageId)}
                                alt={label}
                                sx={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                              />
                            )}
                          </Box>
                          <Box sx={{ px: 1, py: 0.75 }}>
                            <Typography
                              sx={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                            >
                              {label}
                            </Typography>
                            {categoryName && (
                              <Box
                                sx={{
                                  display: 'inline-block', mt: 0.5, px: 0.75, py: 0.25,
                                  borderRadius: 1.5, bgcolor: 'action.hover',
                                }}
                              >
                                <Typography sx={{ fontSize: 10, fontWeight: 500, color: 'text.secondary' }}>
                                  {categoryName}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}
            </Box>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
}
