import { Box, Paper, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ImageUploadArea from '../../common/ImageUploadArea';
import type { SelectedTags } from './types';

interface Props {
  imageUrl: string | null;
  isAnalyzing: boolean;
  analysisComplete: boolean;
  tags: SelectedTags;
  onFileSelect: (file: File) => void;
  onClear: () => void;
}

export default function UploadPanel({ imageUrl, isAnalyzing, analysisComplete, tags, onFileSelect, onClear }: Props) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 3 }}>
      <ImageUploadArea
        imageUrl={imageUrl}
        isProcessing={isAnalyzing}
        processingLabel="Analyzing your item..."
        processingSubLabel="AI is detecting attributes"
        sx={{ flex: 1, minHeight: 0, aspectRatio: 'unset', width: '100%' }}
        onFileSelect={onFileSelect}
        onClear={onClear}
      />

      {analysisComplete && (
        <Paper elevation={0} sx={{ borderRadius: 3, p: 2.5, border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: 'success.main' }}>
            <CheckCircleIcon fontSize="small" />
            <Typography sx={{ fontWeight: 500 }}>Analysis Complete</Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            {([
              { label: 'Category', value: tags.category?.name },
              { label: 'Color',    value: tags.colors?.map(color => color.name).join(', ') },
              { label: 'Season',   value: tags.seasons?.map(season => season.name).join(', ') },
              { label: 'Style',    value: tags.styles?.map(style => style).join(', ') },
            ] as const).map(({ label, value }) => value && (
              <Box key={label} sx={{ bgcolor: 'action.hover', borderRadius: 2, px: 2, py: 1.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {label}
                </Typography>
                <Typography sx={{ fontWeight: 500, mt: 0.25 }}>{value}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
}
