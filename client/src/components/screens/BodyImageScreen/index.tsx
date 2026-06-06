import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, CircularProgress, IconButton,
  Paper, Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineOutlined';
import { GRADIENTS, PRIMARY_ALPHA, SERIF_FONT } from '../../../styles/tokens';
import { useBodyImage, useUploadBodyImage } from '../../../api';
import { imagesApi } from '../../../api/api/images.api';
import { useCurrentUser } from '../../../auth/AuthContext';

const TIPS = [
  { num: 1, text: 'Stand in front of a plain, light-coloured wall' },
  { num: 2, text: 'Keep your full body in frame — head to toe' },
  { num: 3, text: 'Wear fitted clothing so your silhouette is clear' },
  { num: 4, text: 'Good natural lighting gives the best result' },
];

export default function BodyImageScreen() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUserId = useCurrentUser().id;
  const { data: bodyMapping } = useBodyImage(currentUserId);
  const { mutate: upload, isPending, error, reset } = useUploadBodyImage();

  const bodyImageId = bodyMapping?.imageId ?? null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    upload({ file, userId: currentUserId });
  };

  const triggerUpload = () => { reset(); fileInputRef.current?.click(); };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* Header */}
      <Box
        component="header"
        sx={{
          position: 'sticky', top: 0, zIndex: 40,
          bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid', borderColor: 'divider',
          px: 4, py: 3,
        }}
      >
        <Box sx={{ maxWidth: 900, mx: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/profile')} size="small">
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4">Virtual Try-On Model</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              Upload a full-body photo to power the Fitting Room
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Main content */}
      <Box component="main" sx={{ flex: 1, px: 4, py: 5 }}>
        <Box
          sx={{
            maxWidth: 900, mx: 'auto',
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 5,
            alignItems: 'start',
          }}
        >

          {/* Left — preview */}
          <Box
            sx={{
              aspectRatio: '3/4',
              borderRadius: 4,
              overflow: 'hidden',
              position: 'relative',
              background: bodyImageId
                ? 'transparent'
                : `linear-gradient(180deg, #f5f0ea 0%, #ede5d8 100%)`,
              boxShadow: '0 4px 24px -4px rgba(0,0,0,0.10)',
            }}
          >
            {bodyImageId ? (
              <>
                <Box
                  component="img"
                  src={imagesApi.getImageUrl(bodyImageId)}
                  alt="Your virtual model"
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {/* Success badge */}
                <Box
                  sx={{
                    position: 'absolute', top: 16, left: 16, right: 16,
                    bgcolor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
                    borderRadius: 3, px: 2, py: 1.5,
                    display: 'flex', alignItems: 'center', gap: 1,
                  }}
                >
                  <CheckCircleOutlineOutlinedIcon sx={{ color: 'success.main', fontSize: 20 }} />
                  <Typography sx={{ fontWeight: 500, fontSize: 14 }}>Model ready</Typography>
                </Box>
                {/* Re-upload */}
                <Box sx={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
                  <Button
                    fullWidth variant="contained"
                    startIcon={<FileUploadOutlinedIcon />}
                    onClick={triggerUpload}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.88)', color: 'text.primary',
                      backdropFilter: 'blur(12px)', boxShadow: 'none',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.98)', boxShadow: 'none' },
                    }}
                  >
                    Replace photo
                  </Button>
                </Box>
              </>
            ) : isPending ? (
              <Box sx={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 2,
              }}>
                <CircularProgress size={48} />
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', px: 4 }}>
                  Removing background and processing your photo…
                </Typography>
                <Typography variant="caption" color="text.disabled">This may take a moment</Typography>
              </Box>
            ) : (
              <Box
                onClick={triggerUpload}
                sx={{
                  position: 'absolute', inset: 0,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 2,
                  cursor: 'pointer',
                  '&:hover .upload-icon-wrap': { background: GRADIENTS.primaryMedium },
                }}
              >
                <Box
                  className="upload-icon-wrap"
                  sx={{
                    width: 80, height: 80, borderRadius: '50%',
                    background: GRADIENTS.primarySubtle,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.2s ease',
                  }}
                >
                  <PersonOutlineIcon sx={{ fontSize: 44, color: 'primary.main' }} />
                </Box>
                <Typography
                  variant="body2" color="text.secondary"
                  sx={{ textAlign: 'center', px: 6, lineHeight: 1.6 }}
                >
                  Click to upload your full-body photo
                </Typography>
                {error && (
                  <Typography variant="caption" color="error">
                    Upload failed — please try again
                  </Typography>
                )}
              </Box>
            )}
          </Box>

          {/* Right — info + upload */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: { md: 1 } }}>
            <Box>
              <Typography variant="h5" sx={{ fontFamily: SERIF_FONT, mb: 1 }}>
                What is this?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                Your virtual model lets the Fitting Room overlay selected clothes onto a realistic
                digital version of you — so you can see how outfits actually look before wearing
                them.
              </Typography>
            </Box>

            {/* Upload button (idle/error states) */}
            {!bodyImageId && !isPending && (
              <Button
                variant="contained"
                size="large"
                startIcon={<FileUploadOutlinedIcon />}
                onClick={triggerUpload}
                sx={{
                  background: GRADIENTS.primary,
                  color: '#fff',
                  py: 1.75,
                  borderRadius: 3,
                  fontSize: 16,
                  fontWeight: 500,
                  boxShadow: `0 4px 20px ${PRIMARY_ALPHA[35]}`,
                  '&:hover': {
                    filter: 'brightness(1.08)',
                    boxShadow: `0 6px 24px ${PRIMARY_ALPHA[45]}`,
                  },
                }}
              >
                Upload Full-Body Photo
              </Button>
            )}

            {/* Tips */}
            <Paper
              elevation={0}
              sx={{ borderRadius: 3, p: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}
            >
              <Typography
                variant="caption" color="text.secondary"
                sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 2 }}
              >
                Tips for the best result
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {TIPS.map(({ num, text }) => (
                  <Box key={num} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Box sx={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      bgcolor: PRIMARY_ALPHA[10],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                        {num}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ pt: 0.25 }}>
                      {text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>

            {/* Go to fitting room */}
            {bodyImageId && (
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/fitting')}
                sx={{ borderRadius: 3, textTransform: 'none', py: 1.5 }}
              >
                Go to Fitting Room
              </Button>
            )}
          </Box>

        </Box>
      </Box>
    </Box>
  );
}
