import type { ReactNode } from 'react';
import { Box, Button, Dialog, CircularProgress } from '@mui/material';

interface Props {
  open: boolean;
  isDeleting?: boolean;
  cancelLabel?: string;
  confirmLabel?: string;
  width?: number;
  onCancel: () => void;
  onConfirm: () => void;
  children: ReactNode;
}

export default function ConfirmDialogShell({
  open,
  isDeleting,
  cancelLabel = 'Cancel',
  confirmLabel = 'Delete',
  width = 320,
  onCancel,
  onConfirm,
  children,
}: Props) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      slotProps={{ paper: { sx: { borderRadius: 3.5, p: 3, width, maxWidth: '90vw', textAlign: 'center' } } }}
    >
      {children}

      <Box sx={{ display: 'flex', gap: 1.25 }}>
        <Button
          fullWidth
          size="small"
          variant="outlined"
          onClick={onCancel}
          disabled={isDeleting}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 500 }}
        >
          {cancelLabel}
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
          {isDeleting ? <CircularProgress size={16} color="inherit" /> : confirmLabel}
        </Button>
      </Box>
    </Dialog>
  );
}
