import { Box, Typography, Button } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { GRADIENTS, PALETTE, SERIF_FONT } from '../../../styles/tokens';

interface Props {
  itemLabel: 'items' | 'outfits';
  onClearFilters: () => void;
}

export default function FilteredEmptyState({ itemLabel, onClearFilters }: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 2,
        py: 8,
        px: 3,
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: GRADIENTS.primarySubtle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <SearchOffIcon sx={{ fontSize: 36, color: PALETTE.primary }} />
      </Box>

      <Typography sx={{ fontFamily: SERIF_FONT, fontSize: 26, fontWeight: 600 }}>
        Nothing matches — your filters are being picky
      </Typography>

      <Typography color="text.secondary" sx={{ maxWidth: 380 }}>
        No {itemLabel} fit that combination. Loosen up a little, or clear them to see everything again.
      </Typography>

      <Button
        variant="outlined"
        onClick={onClearFilters}
        sx={{
          mt: 1,
          borderRadius: 2.5,
          textTransform: 'none',
          fontWeight: 600,
          px: 3,
        }}
      >
        Clear Filters
      </Button>
    </Box>
  );
}
