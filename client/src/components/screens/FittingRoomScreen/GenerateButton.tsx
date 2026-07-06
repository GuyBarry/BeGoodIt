import { Box, Button, CircularProgress } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CheckIcon from '@mui/icons-material/Check';
import { GRADIENTS, PRIMARY_ALPHA } from '../../../styles/tokens';

interface Props {
  selectedItems: string[];
  isGenerating: boolean;
  onGenerate: () => void;
  hasGeneratedLook: boolean;
  isSaving: boolean;
  isSaved: boolean;
  onSave: () => void;
}

export default function GenerateButton({
  selectedItems, isGenerating, onGenerate, hasGeneratedLook, isSaving, isSaved, onSave,
}: Props) {
  if (hasGeneratedLook) {
    return (
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <Button
          size="large"
          variant="contained"
          startIcon={isSaved ? <CheckIcon /> : isSaving ? <CircularProgress size={16} color="inherit" /> : <FavoriteIcon />}
          onClick={onSave}
          disabled={isSaving || isSaved}
          sx={{
            flex: 2,
            background: GRADIENTS.primary,
            color: '#fff',
            py: 1.25,
            borderRadius: 3,
            fontSize: 16,
            fontWeight: 500,
            boxShadow: `0 4px 20px ${PRIMARY_ALPHA[35]}`,
            '&:hover': { filter: 'brightness(1.08)', boxShadow: `0 6px 24px ${PRIMARY_ALPHA[45]}` },
            '&.Mui-disabled': { background: 'action.disabledBackground', color: 'text.disabled' },
          }}
        >
          {isSaved ? 'Saved!' : isSaving ? 'Saving...' : 'Save Outfit'}
        </Button>
        <Button
          size="large"
          variant="contained"
          disabled
          sx={{
            flex: 1,
            bgcolor: 'action.disabledBackground',
            color: 'text.disabled',
            py: 1.25,
            borderRadius: 3,
            fontSize: 16,
            fontWeight: 500,
            boxShadow: 'none',
            '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'text.disabled' },
          }}
        >
          Recreate
        </Button>
      </Box>
    );
  }

  const label = isGenerating
    ? 'Generating...'
    : `Generate Look${selectedItems.length > 0 ? ` (${selectedItems.length} items)` : ''}`;

  return (
    <Button
      size="large"
      variant="contained"
      fullWidth
      startIcon={<AutoAwesomeIcon />}
      onClick={onGenerate}
      disabled={selectedItems.length === 0 || isGenerating}
      sx={{
        background: GRADIENTS.primary,
        color: '#fff',
        py: 1.25,
        borderRadius: 3,
        fontSize: 16,
        fontWeight: 500,
        boxShadow: `0 4px 20px ${PRIMARY_ALPHA[35]}`,
        '&:hover': { filter: 'brightness(1.08)', boxShadow: `0 6px 24px ${PRIMARY_ALPHA[45]}` },
        '&.Mui-disabled': { background: 'action.disabledBackground', color: 'text.disabled' },
      }}
    >
      {label}
    </Button>
  );
}
