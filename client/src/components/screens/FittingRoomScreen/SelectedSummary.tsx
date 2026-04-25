import { Box, Typography } from '@mui/material';
import { closetItems } from './data';

interface Props {
  selectedItems: number[];
}

export default function SelectedSummary({ selectedItems }: Props) {
  if (selectedItems.length === 0) return null;

  return (
    <Box sx={{ bgcolor: 'action.hover', borderRadius: 3, p: 2 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
        Selected items:
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {selectedItems.map(id => {
          const item = closetItems.find(i => i.id === id);
          return item ? (
            <Box key={id} sx={{ px: 1.5, py: 0.75, bgcolor: 'background.paper', borderRadius: 2, fontSize: 13, fontWeight: 500 }}>
              {item.name}
            </Box>
          ) : null;
        })}
      </Box>
    </Box>
  );
}
