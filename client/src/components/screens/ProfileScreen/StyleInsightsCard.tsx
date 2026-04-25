import { Box, Typography, Paper, Button } from '@mui/material';

interface InsightRow {
  label: string;
  value: string;
  swatch?: boolean;
}

const INSIGHTS: InsightRow[] = [
  { label: 'Most worn color', value: 'Black', swatch: true },
  { label: 'Favorite category', value: 'Tops' },
  { label: 'Items added this month', value: '5' },
];

export default function StyleInsightsCard() {
  return (
    <Paper elevation={0} sx={{ borderRadius: 3, p: 3, border: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h6">
            Style Insights
          </Typography>
          <Typography variant="caption" color="text.secondary">This month's summary</Typography>
        </Box>
        <Button size="small" variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>
          View All
        </Button>
      </Box>
      {INSIGHTS.map(({ label, value, swatch }, i) => (
        <Box
          key={label}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 1.5,
            borderBottom: i < INSIGHTS.length - 1 ? '1px solid' : 'none',
            borderColor: 'divider',
          }}
        >
          <Typography variant="body2">{label}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {swatch && <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#1a1a1a' }} />}
            <Typography variant="body2" sx={{ fontWeight: 500 }}>{value}</Typography>
          </Box>
        </Box>
      ))}
    </Paper>
  );
}
