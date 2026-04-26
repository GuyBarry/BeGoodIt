import { Box, Paper, Typography } from '@mui/material';
import { PRIMARY_ALPHA } from '../../../styles/tokens';

const TIPS = [
  'Use good lighting and a plain background for clear visibility',
  'Capture the full garment in frame without cropping',
  'Lay flat or hang for best shape recognition by AI',
];

export default function TipsCard() {
  return (
    <Paper elevation={0} sx={{ borderRadius: 3, p: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 2 }}>
        Tips for best results
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {TIPS.map((tip, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <Box sx={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              bgcolor: PRIMARY_ALPHA[10],
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>{i + 1}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ pt: 0.25 }}>{tip}</Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
