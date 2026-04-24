import { Box, Button, CircularProgress, Dialog, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloseIcon from '@mui/icons-material/Close';
import UploadIcon from '@mui/icons-material/Upload';
import { GRADIENTS, PRIMARY_ALPHA, SERIF_FONT } from '../../../styles/tokens';

interface Props {
  open: boolean;
  inspirationImage: string | null;
  isAnalyzing: boolean;
  onClose: () => void;
  onUpload: () => void;
  onClearImage: () => void;
}

export default function GetInspiredDialog({ open, inspirationImage, isAnalyzing, onClose, onUpload, onClearImage }: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ fontFamily: SERIF_FONT, fontSize: 22, fontWeight: 600, pr: 6 }}>
        Get Inspired
        <IconButton onClick={onClose} size="small" sx={{ position: 'absolute', right: 16, top: 16, color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pb: 3 }}>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Upload a style inspiration photo from Pinterest, Instagram, or any fashion source.
          We'll scan your closet and suggest the most similar items you already own to recreate that look.
        </Typography>

        {!inspirationImage ? (
          <Box
            component="button"
            onClick={onUpload}
            sx={{
              width: '100%',
              aspectRatio: '16/9',
              borderRadius: 3,
              border: '2px dashed',
              borderColor: 'divider',
              bgcolor: 'action.hover',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': { borderColor: 'primary.main', bgcolor: PRIMARY_ALPHA[4] },
            }}
          >
            <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: PRIMARY_ALPHA[10], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UploadIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography fontWeight={500}>Upload inspiration image</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Click to browse your gallery</Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ position: 'relative', aspectRatio: '16/9', borderRadius: 3, overflow: 'hidden' }}>
            <Box component="img" src={inspirationImage} alt="Inspiration" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {isAnalyzing && (
              <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <CircularProgress sx={{ color: '#fff' }} size={56} />
                <Box sx={{ textAlign: 'center', color: '#fff' }}>
                  <Typography fontWeight={500} fontSize={17}>Analyzing your inspiration...</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>Finding matching items in your closet</Typography>
                </Box>
              </Box>
            )}
            <IconButton
              onClick={onClearImage}
              size="small"
              sx={{ position: 'absolute', top: 12, right: 12, bgcolor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', '&:hover': { bgcolor: '#fff' } }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1.5, mt: 3 }}>
          <Button variant="outlined" fullWidth onClick={onClose} sx={{ borderRadius: 2.5, py: 1.25 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            fullWidth
            startIcon={<AutoAwesomeIcon />}
            onClick={onUpload}
            disabled={isAnalyzing}
            sx={{ borderRadius: 2.5, py: 1.25, background: GRADIENTS.primary, boxShadow: 'none', '&:hover': { filter: 'brightness(1.08)', boxShadow: 'none' } }}
          >
            Find Matches
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
