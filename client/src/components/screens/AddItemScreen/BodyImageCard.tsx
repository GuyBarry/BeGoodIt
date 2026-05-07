import { useRef, useState } from 'react';
import { Box, Button, CircularProgress, Paper, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import { GRADIENTS } from '../../../styles/tokens';
import { useUploadBodyImage } from '../../../api';
import { imagesApi } from '../../../api/api/images.api';
import type { User } from '../../../entities/user';

interface Props {
  userId: User['id'];
}

export default function AvatarCard({ userId }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bodyImageId, setBodyImageId] = useState<string | null>(null);
  const { mutate: uploadBodyImage, isPending, error, reset } = useUploadBodyImage();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    uploadBodyImage(
      { file, userId },
      { onSuccess: (result) => setBodyImageId(result.imageId) },
    );
  };

  return (
    <Paper elevation={0} sx={{ borderRadius: 3, p: 3, border: '1px solid', borderColor: 'divider' }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <Box sx={{ display: 'flex', gap: 2.5 }}>
        <Box sx={{
          width: 64, height: 64, borderRadius: 3, flexShrink: 0, overflow: 'hidden',
          background: bodyImageId ? 'transparent' : GRADIENTS.primarySubtle,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {bodyImageId ? (
            <Box
              component="img"
              src={imagesApi.getImageUrl(bodyImageId)}
              alt="Your body image"
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <AutoAwesomeIcon sx={{ color: 'primary.main', fontSize: 28 }} />
          )}
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="h6">
            {bodyImageId ? 'Body Image Ready' : 'Upload Your Body Image'}
          </Typography>

          {bodyImageId ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 16, color: 'success.main' }} />
                <Typography variant="body2" color="success.main">
                  Photo uploaded successfully
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                onClick={() => fileInputRef.current?.click()}
                sx={{ mt: 1.5, borderRadius: 2, textTransform: 'none' }}
              >
                Re-upload Photo
              </Button>
            </>
          ) : isPending ? (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Removing background and processing your photo…
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
                <CircularProgress size={16} />
                <Typography variant="body2" color="text.secondary">This may take a moment</Typography>
              </Box>
            </>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Upload a full-body photo to enable virtual try-on. AI will create a digital version of you for realistic outfit previews.
              </Typography>
              {error && (
                <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
                  Upload failed. Please try again.
                </Typography>
              )}
              <Button
                size="small"
                variant="contained"
                onClick={() => { reset(); fileInputRef.current?.click(); }}
                sx={{ mt: 1.5, borderRadius: 2, textTransform: 'none' }}
              >
                Upload Photo
              </Button>
            </>
          )}
        </Box>
      </Box>
    </Paper>
  );
}
