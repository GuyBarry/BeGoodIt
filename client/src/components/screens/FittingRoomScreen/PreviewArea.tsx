import { Box, CircularProgress, IconButton, Tooltip, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { GRADIENTS, PRIMARY_ALPHA } from '../../../styles/tokens';

interface Props {
  isGenerating: boolean;
  generatedLookUrl: string | null;
  suggestedItems: string[];
  onReset: () => void;
  isSaving: boolean;
  isSaved: boolean;
  onSave: () => void;
}

export default function PreviewArea({
  isGenerating, generatedLookUrl, suggestedItems, onReset, isSaving, isSaved, onSave,
}: Props) {
  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        aspectRatio: { xs: '3/4', lg: 'unset' },
        maxHeight: { xs: 600, lg: 'unset' },
        borderRadius: 4,
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #f5f0ea 0%, #ede5d8 100%)',
        boxShadow: '0 4px 20px -4px rgba(0,0,0,0.08)',
      }}
    >
      {!generatedLookUrl ? (
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
            src={generatedLookUrl}
            alt="Generated look"
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <Box sx={{ position: 'absolute', bottom: 24, right: 24, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Tooltip title={isSaved ? 'Saved' : 'Save Outfit'} placement="top">
              <span>
                <IconButton
                  onClick={onSave}
                  disabled={isSaving || isSaved}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(12px)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' },
                    '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.85)' },
                  }}
                >
                  {isSaving ? (
                    <CircularProgress size={20} />
                  ) : isSaved ? (
                    <FavoriteIcon sx={{ color: '#e53950' }} />
                  ) : (
                    <FavoriteBorderIcon />
                  )}
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Reset" placement="top">
              <IconButton
                onClick={onReset}
                sx={{ bgcolor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' } }}
              >
                <RestartAltIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </>
      )}
    </Box>
  );
}
