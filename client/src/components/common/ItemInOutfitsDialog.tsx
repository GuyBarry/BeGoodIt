import { Box, Typography } from '@mui/material';
import ConfirmDialogShell from './ConfirmDialogShell';
import Thumbnail from './Thumbnail';
import { imagesApi } from '../../api/api/images.api';
import type { OutfitConflict } from '../../api/api/closet.api';

interface Props {
  open: boolean;
  itemImageUrl?: string | null;
  outfits: OutfitConflict[];
  isDeleting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ItemInOutfitsDialog({ open, itemImageUrl, outfits, isDeleting, onCancel, onConfirm }: Props) {
  const isSingle = outfits.length === 1;

  return (
    <ConfirmDialogShell
      open={open}
      isDeleting={isDeleting}
      width={340}
      cancelLabel="Keep everything"
      confirmLabel={isSingle ? 'Delete both' : 'Delete all'}
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      <Thumbnail size={64} src={itemImageUrl} alt="Item to delete" sx={{ mx: 'auto', mb: 2 }} />

      <Typography sx={{ fontWeight: 600, fontSize: 16, lineHeight: 1.4, mb: 1.5 }}>
        This item is used in {isSingle ? 'an outfit' : `${outfits.length} outfits`}
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', mb: 1.5 }}>
        {outfits.map(outfit => (
          <Thumbnail
            key={outfit.id}
            size={52}
            fit="cover"
            src={outfit.imageId ? imagesApi.getImageUrl(outfit.imageId) : null}
            alt={outfit.name || 'Outfit'}
          />
        ))}
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Deleting it will also delete {isSingle ? 'that outfit' : 'those outfits'}. You can keep everything as is instead.
      </Typography>
    </ConfirmDialogShell>
  );
}
