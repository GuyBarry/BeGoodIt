import { Box, Typography } from '@mui/material';
import type { ClothingItem } from '../../../entities/clothingItem';

interface Props {
  selectedItems: string[];
  clothingItems: ClothingItem[];
}

export default function SelectedSummary({ selectedItems, clothingItems }: Props) {
  if (selectedItems.length === 0) return null;

  return (
    <Box sx={{ bgcolor: 'action.hover', borderRadius: 3, p: 2 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
        Selected items:
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {selectedItems.map(id => {
          const item = clothingItems.find(i => i.id === id);
          const name = item ? (item.style || item.category?.name || 'Item') : 'Item';
          return (
            <Box key={id} sx={{ px: 1.5, py: 0.75, bgcolor: 'background.paper', borderRadius: 2, fontSize: 13, fontWeight: 500 }}>
              {name}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
