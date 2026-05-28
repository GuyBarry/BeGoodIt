import { Box, Button, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { GRADIENTS } from '../../../styles/tokens';
import ImageUploadArea from '../../common/ImageUploadArea';

interface Props {
  inspirationImage: string | null;
  isAnalyzing: boolean;
  onFileSelect: (file: File) => void;
  onFindMatches: () => void;
  onClearImage: () => void;
}

export default function GetInspiredPanel({
  inspirationImage,
  isAnalyzing,
  onFileSelect,
  onFindMatches,
  onClearImage,
}: Props) {
  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden' }}>
      <Box sx={{ flexShrink: 0 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>Upload your inspiration</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
          Drop a photo from Pinterest, Instagram, or any fashion source.
          We'll scan your closet and highlight the closest items you already own.
        </Typography>
      </Box>
      <ImageUploadArea
        imageUrl={inspirationImage}
        isProcessing={isAnalyzing}
        processingLabel="Analyzing your inspiration..."
        processingSubLabel="Finding matching items in your closet"
        sx={{ flex: 1, minHeight: 0, aspectRatio: 'unset', width: '100%' }}
        onFileSelect={onFileSelect}
        onClear={onClearImage}
      />
      <Button
        variant="contained"
        fullWidth
        startIcon={<AutoAwesomeIcon />}
        onClick={onFindMatches}
        disabled={!inspirationImage || isAnalyzing}
        sx={{
          flexShrink: 0,
          borderRadius: 3, py: 1.25,
          fontSize: 16, fontWeight: 500,
          background: GRADIENTS.primary,
          boxShadow: 'none',
          '&:hover': { filter: 'brightness(1.08)', boxShadow: 'none' },
        }}
      >
        {isAnalyzing ? 'Finding matches...' : 'Find Matches in My Closet'}
      </Button>
    </Box>
  );
}
