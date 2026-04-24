import { Button, Dialog, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloseIcon from '@mui/icons-material/Close';
import { GRADIENTS, SERIF_FONT } from '../../../styles/tokens';
import ImageUploadArea from '../../common/ImageUploadArea';

interface Props {
  open: boolean;
  inspirationImage: string | null;
  isAnalyzing: boolean;
  onClose: () => void;
  onFileSelect: (file: File) => void;
  onFindMatches: () => void;
  onClearImage: () => void;
}

export default function GetInspiredDialog({
  open,
  inspirationImage,
  isAnalyzing,
  onClose,
  onFileSelect,
  onFindMatches,
  onClearImage,
}: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ fontFamily: SERIF_FONT, fontSize: 22, fontWeight: 600, pr: 6 }}>
        Get Inspired
        <IconButton onClick={onClose} size="small" sx={{ position: 'absolute', right: 16, top: 16, color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pb: 3 }}>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Upload a style inspiration photo from Pinterest, Instagram, or any fashion source.
          We'll scan your closet and suggest the most similar items you already own to recreate that look.
        </Typography>

        <ImageUploadArea
          imageUrl={inspirationImage}
          isProcessing={isAnalyzing}
          processingLabel="Analyzing your inspiration..."
          processingSubLabel="Finding matching items in your closet"
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
            mt: 3,
            borderRadius: 2.5,
            py: 1.25,
            background: GRADIENTS.primary,
            boxShadow: 'none',
            '&:hover': { filter: 'brightness(1.08)', boxShadow: 'none' },
          }}
        >
          Find Matches
        </Button>
      </DialogContent>
    </Dialog>
  );
}
