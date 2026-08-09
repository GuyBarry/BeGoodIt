import { useEffect, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { IMAGE_TOO_LARGE_EVENT, MAX_IMAGE_SIZE_MB } from '../lib/imageUpload';

// Listens for the app-wide "image too large" event (emitted from client-side
// validation or a 413 response from the server) and shows a full-width red
// alert at the top of the screen.
export default function UploadErrorBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleTooLarge = () => setOpen(true);
    window.addEventListener(IMAGE_TOO_LARGE_EVENT, handleTooLarge);
    return () => window.removeEventListener(IMAGE_TOO_LARGE_EVENT, handleTooLarge);
  }, []);

  return (
    <Snackbar
      open={open}
      autoHideDuration={5000}
      onClose={() => setOpen(false)}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{ width: '100%', maxWidth: 'none', left: 0, right: 0, top: '0 !important' }}
    >
      <Alert
        onClose={() => setOpen(false)}
        severity="error"
        variant="filled"
        sx={{ width: '100%', borderRadius: 0, justifyContent: 'center' }}
      >
        Image is too large. Please upload an image under {MAX_IMAGE_SIZE_MB}MB.
      </Alert>
    </Snackbar>
  );
}
