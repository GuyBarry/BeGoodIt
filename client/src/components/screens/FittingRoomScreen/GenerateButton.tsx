import { Button } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { GRADIENTS, PRIMARY_ALPHA } from '../../../styles/tokens';

interface Props {
  selectedItems: number[];
  isGenerating: boolean;
  onGenerate: () => void;
}

export default function GenerateButton({ selectedItems, isGenerating, onGenerate }: Props) {
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
        py: 1.75,
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
