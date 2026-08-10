import { useRef, useState } from 'react';
import { Box, Button, CircularProgress, Dialog, DialogContent, DialogTitle, IconButton, TextField, Typography } from '@mui/material';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LinkIcon from '@mui/icons-material/Link';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import { GRADIENTS, PRIMARY_ALPHA, SERIF_FONT } from '../../../styles/tokens';
import apiClient from '../../../api/client';
import { emitImageTooLarge, isImageTooLarge } from '../../../lib/imageUpload';

interface Props {
  onAnalyze: (imageUrl: string, name: string, file?: File) => void;
}

export default function UploadPanel({ onAnalyze }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlDialogOpen, setUrlDialogOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState('');
  const [isFetching, setIsFetching] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    if (isImageTooLarge(file)) {
      emitImageTooLarge();
      return;
    }
    onAnalyze(URL.createObjectURL(file), file.name.replace(/\.[^/.]+$/, ''), file);
  };

  const handleUrlSubmit = async () => {
    const trimmed = urlInput.trim();
    if (!trimmed) { setUrlError('Please enter a URL'); return; }
    try { new URL(trimmed); } catch { setUrlError('Please enter a valid URL'); return; }

    setUrlError('');
    setIsFetching(true);
    try {
      const response = await apiClient.get<Blob>('/smart-buy/product-image', {
        params: { url: trimmed },
        responseType: 'blob',
      });
      const blob = response.data;
      const file = new File([blob], 'product.jpg', { type: blob.type || 'image/jpeg' });
      const objectUrl = URL.createObjectURL(blob);

      const rawTitle = response.headers['x-product-title'];
      const title = rawTitle ? decodeURIComponent(rawTitle) : 'Item from link';

      setUrlInput('');
      setUrlDialogOpen(false);
      onAnalyze(objectUrl, title, file);
    } catch (err: any) {
      if (err?.response?.status === 451) {
        setUrlError('BOT_PROTECTED');
      } else {
        let message: string | null = null;
        try {
          const data = err?.response?.data;
          const text = data instanceof Blob ? await data.text()
            : typeof data === 'string' ? data
            : JSON.stringify(data ?? '');
          const parsed = JSON.parse(text);
          // The server's error handler responds with { message }; fall back to
          // `.error` just in case an endpoint uses that shape instead.
          message = parsed.message ?? parsed.error ?? null;
        } catch { /* ignore */ }
        setUrlError(message ?? 'Could not find the product image. Try uploading it directly.');
      }
    } finally {
      setIsFetching(false);
    }
  };

  const handleCloseDialog = () => {
    if (isFetching) return;
    setUrlDialogOpen(false);
    setUrlInput('');
    setUrlError('');
  };

  const actionCardSx = {
    width: '100%',
    display: 'flex', alignItems: 'center', gap: 2,
    p: 2.5,
    bgcolor: 'background.paper',
    border: '1px solid', borderColor: 'divider',
    borderRadius: 3,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    '&:hover': { borderColor: PRIMARY_ALPHA[35], boxShadow: `0 2px 12px ${PRIMARY_ALPHA[10]}` },
  };

  return (
    <>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3, alignItems: 'stretch' }}>
        {/* Left — hero card */}
        <Box
          sx={{
            borderRadius: '24px', p: 4,
            background: GRADIENTS.primarySubtle,
            border: '1px solid', borderColor: PRIMARY_ALPHA[20],
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
            <Box
              sx={{
                width: 64, height: 64, borderRadius: 3, flexShrink: 0,
                bgcolor: PRIMARY_ALPHA[20],
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <ShoppingBagIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            </Box>
            <Box>
              <Typography sx={{ fontFamily: SERIF_FONT, fontSize: 24, fontWeight: 600, lineHeight: 1.3 }}>
                Before you buy
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1, fontSize: 16, lineHeight: 1.65 }}>
                Upload any item you're considering and see how it fits with your existing wardrobe. Make smarter purchasing decisions and reduce impulse buys.
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Right — action cards */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box component="button" sx={actionCardSx} onClick={() => fileInputRef.current?.click()}>
            <Box sx={{ width: 56, height: 56, borderRadius: 2, flexShrink: 0, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CloudUploadIcon sx={{ color: 'text.secondary', fontSize: 28 }} />
            </Box>
            <Box sx={{ flex: 1, textAlign: 'left' }}>
              <Typography sx={{ fontWeight: 500, fontSize: 17 }}>Upload Image</Typography>
              <Typography variant="body2" color="text.secondary">From your gallery</Typography>
            </Box>
            <ChevronRightIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
          </Box>

          <Box component="button" sx={actionCardSx} onClick={() => setUrlDialogOpen(true)}>
            <Box sx={{ width: 56, height: 56, borderRadius: 2, flexShrink: 0, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LinkIcon sx={{ color: 'text.secondary', fontSize: 28 }} />
            </Box>
            <Box sx={{ flex: 1, textAlign: 'left' }}>
              <Typography sx={{ fontWeight: 500, fontSize: 17 }}>Paste URL</Typography>
              <Typography variant="body2" color="text.secondary">Link from any store</Typography>
            </Box>
            <ChevronRightIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
          </Box>
        </Box>
      </Box>

      {/* URL Dialog */}
      <Dialog
        open={urlDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, p: 1 } } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <LinkIcon sx={{ color: 'primary.main' }} />
            <Typography sx={{ fontWeight: 600, fontSize: 18 }}>Paste item URL</Typography>
          </Box>
          <IconButton size="small" onClick={handleCloseDialog}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          {urlError === 'BOT_PROTECTED' ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ bgcolor: 'warning.light', borderRadius: 2, p: 2 }}>
                <Typography sx={{ fontWeight: 600, mb: 0.5 }}>This site blocks automated access</Typography>
                <Typography variant="body2">
                  Stores like Zara and H&M prevent bots from reading their pages. Try pasting the <strong>direct image URL</strong> instead:
                </Typography>
              </Box>
              <Box component="ol" sx={{ m: 0, pl: 2.5, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                <Typography component="li" variant="body2">Open the product page in your browser</Typography>
                <Typography component="li" variant="body2">Right-click the main product photo</Typography>
                <Typography component="li" variant="body2">Click <strong>"Copy image address"</strong></Typography>
                <Typography component="li" variant="body2">Paste it here instead</Typography>
              </Box>
              <TextField
                fullWidth autoFocus
                placeholder="https://cdn.store.com/image.jpg"
                value={urlInput}
                onChange={e => { setUrlInput(e.target.value); setUrlError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleUrlSubmit()}
              />
              <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={handleCloseDialog} sx={{ borderRadius: 2, textTransform: 'none' }}>Cancel</Button>
                <Button variant="contained" onClick={handleUrlSubmit} disabled={!urlInput.trim() || isFetching}
                  startIcon={isFetching ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : undefined}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
                  {isFetching ? 'Fetching image...' : 'Try Again'}
                </Button>
              </Box>
            </Box>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Paste a link from any online store and we'll analyze how the item fits with your wardrobe.
              </Typography>
              <TextField
                fullWidth autoFocus
                placeholder="https://store.com/item..."
                value={urlInput}
                onChange={e => { setUrlInput(e.target.value); setUrlError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleUrlSubmit()}
                error={!!urlError}
                helperText={urlError}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={handleCloseDialog} disabled={isFetching} sx={{ borderRadius: 2, textTransform: 'none' }}>
                  Cancel
                </Button>
                <Button variant="contained" onClick={handleUrlSubmit} disabled={!urlInput.trim() || isFetching}
                  startIcon={isFetching ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : undefined}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
                  {isFetching ? 'Fetching image...' : 'Analyze Compatibility'}
                </Button>
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
