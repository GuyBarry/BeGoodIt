import { Box, Button, IconButton, Paper, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { GRADIENTS, PRIMARY_ALPHA } from '../../../styles/tokens';

interface Props {
  selectedItems: number[];
  isGenerating: boolean;
  generatedLook: boolean;
  suggestedItems: number[];
  onReset: () => void;
}

export default function PreviewArea({ selectedItems, isGenerating, generatedLook, suggestedItems, onReset }: Props) {
  return (
    <Box
      sx={{
        position: 'relative',
        aspectRatio: '3/4',
        maxHeight: 600,
        borderRadius: 4,
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #f5f0ea 0%, #ede5d8 100%)',
        boxShadow: '0 4px 20px -4px rgba(0,0,0,0.08)',
      }}
    >
      {!generatedLook ? (
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {isGenerating ? (
            <Box sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  width: 96, height: 96, borderRadius: '50%',
                  bgcolor: PRIMARY_ALPHA[15],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  mx: 'auto', mb: 3,
                }}
              >
                <AutoFixHighIcon
                  sx={{
                    fontSize: 44, color: 'primary.main',
                    animation: 'spin 3s linear infinite',
                    '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
                  }}
                />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 500 }}>Creating your look...</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>AI is working its magic</Typography>
            </Box>
          ) : (
            <>
              <Box
                sx={{
                  width: 160, height: 160, borderRadius: '50%',
                  background: GRADIENTS.primaryMedium,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3,
                }}
              >
                <AutoAwesomeIcon sx={{ fontSize: 64, color: PRIMARY_ALPHA[55] }} />
              </Box>
              <Typography
                variant="body1" color="text.secondary"
                sx={{ textAlign: 'center', px: 6, fontSize: 17, lineHeight: 1.6 }}
              >
                Select items from your closet and click{' '}
                <Box component="span" sx={{ color: 'primary.main', fontWeight: 500 }}>Generate Look</Box>
                {' '}to see yourself wearing them
              </Typography>
              {suggestedItems.length > 0 && (
                <Box
                  sx={{
                    mt: 3, px: 3, py: 1.25,
                    bgcolor: PRIMARY_ALPHA[10],
                    borderRadius: 10,
                    fontSize: 13, color: 'primary.main', fontWeight: 500,
                  }}
                >
                  ✨ {suggestedItems.length} items suggested from your inspiration
                </Box>
              )}
            </>
          )}
        </Box>
      ) : (
        <>
          <Box
            component="img"
            src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=800&fit=crop"
            alt="Generated look"
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <Box sx={{ position: 'absolute', top: 24, left: 24, right: 24 }}>
            <Paper sx={{ borderRadius: 3, p: 2, bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main', mb: 0.5 }}>
                <AutoAwesomeIcon sx={{ fontSize: 18 }} />
                <Typography sx={{ fontWeight: 500, fontSize: 14 }}>AI Generated</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Based on {selectedItems.length} items from your closet
              </Typography>
            </Paper>
          </Box>
          <Box sx={{ position: 'absolute', bottom: 24, left: 24, right: 24, display: 'flex', gap: 1.5 }}>
            <Button
              variant="contained"
              startIcon={<FavoriteIcon />}
              sx={{
                flex: 1,
                bgcolor: 'rgba(255,255,255,0.85)',
                color: 'text.primary',
                backdropFilter: 'blur(12px)',
                boxShadow: 'none',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.95)', boxShadow: 'none' },
              }}
            >
              Save Look
            </Button>
            <IconButton sx={{ bgcolor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' } }}>
              <ShareIcon />
            </IconButton>
            <IconButton
              onClick={onReset}
              sx={{ bgcolor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' } }}
            >
              <RestartAltIcon />
            </IconButton>
          </Box>
        </>
      )}
    </Box>
  );
}
