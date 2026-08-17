import { Typography } from '@mui/material';
import { keyframes } from '@emotion/react';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import ConfirmDialogShell from './ConfirmDialogShell';
import Thumbnail from './Thumbnail';

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
    <ConfirmDialogShell
      open={open}
      isDeleting={isDeleting}
      cancelLabel="Keep it"
      confirmLabel="Delete"
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      <Thumbnail
        size={64}
        src={imageUrl}
        alt={itemName}
        fallbackBgcolor="error.light"
        fallback={<DeleteOutlineIcon sx={{ fontSize: 28, color: 'error.dark', animation: `${wiggle} 0.6s ease 0.2s` }} />}
        sx={{ mx: 'auto', mb: 2 }}
      />

      <Typography sx={{ fontWeight: 600, fontSize: 16, lineHeight: 1.4, mb: 2.5 }}>
        Sure you want to say goodbye to this one?
      </Typography>
    </ConfirmDialogShell>
  );
}
