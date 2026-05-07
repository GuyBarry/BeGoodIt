import { Box, Typography, Paper, Grid } from '@mui/material';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import PaletteIcon from '@mui/icons-material/Palette';
import { PRIMARY_ALPHA } from '../../../styles/tokens';
import type { SvgIconComponent } from '@mui/icons-material';

interface Stat {
  label: string;
  value: string | number;
  Icon: SvgIconComponent;
}

interface Props {
  itemsCount: number;
}

export default function StatsGrid({ itemsCount }: Props) {
  const STATS: Stat[] = [
    { label: 'Total Items', value: itemsCount, Icon: CheckroomIcon },
    { label: 'Outfits Created', value: 23, Icon: PaletteIcon },
  ];

  return (
    <Grid container spacing={1.5}>
      {STATS.map(({ label, value, Icon }) => (
        <Grid key={label} size={{ xs: 6 }}>
          <Paper elevation={0} sx={{ borderRadius: 3, p: 2.5, border: '1px solid', borderColor: 'divider' }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: PRIMARY_ALPHA[10],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5,
              }}
            >
              <Icon sx={{ color: 'primary.main', fontSize: 20 }} />
            </Box>
            <Typography variant="h5">{value}</Typography>
            <Typography variant="caption" color="text.secondary">{label}</Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
