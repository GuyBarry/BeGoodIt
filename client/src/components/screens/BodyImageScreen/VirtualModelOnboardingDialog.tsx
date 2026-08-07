import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box, Button, CircularProgress, Dialog, DialogContent, IconButton, Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineOutlined';
import { GRADIENTS, PRIMARY_ALPHA, SERIF_FONT } from '../../../styles/tokens';
import { useBodyImage, useUploadBodyImage } from '../../../api';
import { useCurrentUser } from '../../../auth/AuthContext';

const TIPS = [
  'Stand in front of a plain, light-coloured wall',
  'Keep your full body in frame — head to toe',
  'Good natural lighting gives the best result',
];

// Routes where this onboarding prompt shouldn't pile on top of the page's
// own UI (the dedicated upload screen, and the pre-auth login screen).
const SKIP_ROUTES = ['/login', '/body'];

export default function VirtualModelOnboardingDialog() {
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUserId = useCurrentUser().id;
  const { data: bodyMapping, isLoading } = useBodyImage(currentUserId);
  const { mutate: upload, isPending, error, reset } = useUploadBodyImage();

  // Dismissing only hides it for the rest of this session — it's a nudge,
  // not a nag, but it should keep offering until a model actually exists.
  const [dismissed, setDismissed] = useState(false);
  const [justUploaded, setJustUploaded] = useState(false);

  const hasBodyImage = !!bodyMapping?.imageId;
  const open =
    !!currentUserId &&
    !isLoading &&
    // Once the upload succeeds, `hasBodyImage` flips true immediately (the
    // mutation writes straight into this query's cache) — keep the dialog
    // open through the "Photo uploaded!" state so it doesn't vanish before
    // its own auto-close timer.
    (!hasBodyImage || justUploaded) &&
    !dismissed &&
    !SKIP_ROUTES.includes(location.pathname);

  // Auto-dismiss shortly after a successful upload so the tutorial doesn't
  // linger once its job is done.
  useEffect(() => {
    if (!justUploaded) return;
    const timer = setTimeout(() => setDismissed(true), 2000);
    return () => clearTimeout(timer);
  }, [justUploaded]);

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    upload({ file, userId: currentUserId }, { onSuccess: () => setJustUploaded(true) });
  };

  const triggerUpload = () => { reset(); fileInputRef.current?.click(); };
  const close = () => setDismissed(true);

  return (
    <Dialog
      open
      onClose={close}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden' } } }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <IconButton
        onClick={close}
        size="small"
        aria-label="Dismiss"
        sx={{
          position: 'absolute', top: 12, right: 12, zIndex: 1,
          color: 'text.secondary',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>

      <DialogContent sx={{ p: 4, pt: 4.5, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <Box
          sx={{
            width: 56, height: 56, borderRadius: '50%',
            background: GRADIENTS.primarySubtle,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mb: 2,
          }}
        >
          <PersonOutlineIcon sx={{ fontSize: 30, color: 'primary.main' }} />
        </Box>

        <Box
          sx={{
            px: 1.25, py: 0.5, mb: 1.5,
            borderRadius: 10,
            bgcolor: PRIMARY_ALPHA[10],
          }}
        >
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'primary.main' }}>
            Required to use Virtual Try-On
          </Typography>
        </Box>

        <Typography variant="h6" sx={{ fontFamily: SERIF_FONT, fontWeight: 600, mb: 1 }}>
          Set up your virtual model
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: 3, px: 1 }}>
          Upload a full-body photo so the Fitting Room can show you how clothes actually
          look on you before you buy them.
        </Typography>

        <Box
          onClick={isPending || justUploaded ? undefined : triggerUpload}
          sx={{
            width: '100%',
            borderRadius: 3,
            border: '1.5px dashed',
            borderColor: justUploaded ? 'success.main' : PRIMARY_ALPHA[25],
            bgcolor: justUploaded ? 'success.light' : PRIMARY_ALPHA[4],
            py: 3.5,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
            cursor: isPending || justUploaded ? 'default' : 'pointer',
            transition: 'border-color 0.15s ease, background 0.15s ease',
            '&:hover': isPending || justUploaded ? undefined : { borderColor: PRIMARY_ALPHA[45], bgcolor: PRIMARY_ALPHA[10] },
          }}
        >
          {justUploaded ? (
            <>
              <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 28, color: 'success.dark' }} />
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'success.dark' }}>
                Photo uploaded!
              </Typography>
            </>
          ) : isPending ? (
            <>
              <CircularProgress size={28} sx={{ my: 0.5 }} />
              <Typography variant="body2" color="text.secondary">Uploading…</Typography>
            </>
          ) : (
            <>
              <FileUploadOutlinedIcon sx={{ fontSize: 28, color: 'primary.main' }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Click to upload a photo
              </Typography>
              <Typography variant="caption" color="text.secondary">JPG or PNG</Typography>
            </>
          )}
        </Box>

        {error && (
          <Typography variant="caption" color="error" sx={{ mt: 1.5 }}>
            Upload failed — please try again
          </Typography>
        )}

        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0.75, mt: 3, mb: 2, textAlign: 'left' }}>
          {TIPS.map(tip => (
            <Box key={tip} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <Box sx={{
                width: 4, height: 4, borderRadius: '50%', flexShrink: 0, mt: '7px',
                bgcolor: PRIMARY_ALPHA[45],
              }} />
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>{tip}</Typography>
            </Box>
          ))}
        </Box>

        {!justUploaded && (
          <>
            <Button
              fullWidth
              variant="outlined"
              onClick={close}
              sx={{
                mt: 0.5,
                borderRadius: 2.5,
                textTransform: 'none',
                fontWeight: 500,
                py: 1.2,
                color: 'text.secondary',
                borderColor: 'divider',
                '&:hover': { borderColor: 'text.secondary', bgcolor: 'action.hover' },
              }}
            >
              Maybe later
            </Button>
            <Typography variant="caption" color="text.disabled" sx={{ mt: 1.25 }}>
              You won't be able to try on clothes until this is added.
            </Typography>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
