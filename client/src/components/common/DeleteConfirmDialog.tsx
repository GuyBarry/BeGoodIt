import { Box, Button, Dialog, Typography, CircularProgress } from '@mui/material';
import { keyframes } from '@emotion/react';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';

const wiggle = keyframes`
  0%, 100% { transform: rotate(0deg); }
  20%      { transform: rotate(-12deg); }
  40%      { transform: rotate(10deg); }
  60%      { transform: rotate(-7deg); }
  80%      { transform: rotate(5deg); }
`;

interface Props {
  open: boolean;
  itemName: string;
  imageUrl?: string | null;
  isDeleting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmDialog({ open, itemName, imageUrl, isDeleting, onCancel, onConfirm }: Props) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      slotProps={{ paper: { sx: { borderRadius: 3.5, p: 3, width: 320, maxWidth: '90vw', textAlign: 'center' } } }}
    >
      <Box
        sx={{
          width: 64, height: 64, mx: 'auto', mb: 2,
          borderRadius: imageUrl ? 2.5 : '50%',
          overflow: 'hidden',
          bgcolor: imageUrl ? 'grey.50' : 'error.light',
          border: imageUrl ? '1px solid' : 'none',
          borderColor: 'divider',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {imageUrl ? (
          <Box
            component="img"
            src={imageUrl}
            alt={itemName}
            sx={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          />
        ) : (
          <DeleteOutlineIcon sx={{ fontSize: 28, color: 'error.dark', animation: `${wiggle} 0.6s ease 0.2s` }} />
        )}
      </Box>

      <Typography sx={{ fontWeight: 600, fontSize: 16, lineHeight: 1.4, mb: 2.5 }}>
        Sure you want to say goodbye to this one?
      </Typography>

      <Box sx={{ display: 'flex', gap: 1.25 }}>
        <Button
          fullWidth
          size="small"
          variant="outlined"
          onClick={onCancel}
          disabled={isDeleting}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 500 }}
        >
          Keep it
        </Button>
        <Button
          fullWidth
          size="small"
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={isDeleting}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 500 }}
        >
          {isDeleting ? <CircularProgress size={16} color="inherit" /> : 'Delete'}
        </Button>
      </Box>
    </Dialog>
  );
}
