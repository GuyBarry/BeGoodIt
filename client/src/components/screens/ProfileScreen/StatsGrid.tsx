import { Box, Typography, Grid } from '@mui/material';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import PaletteIcon from '@mui/icons-material/Palette';
import { PRIMARY_ALPHA } from '../../../styles/tokens';
import type { SvgIconComponent } from '@mui/icons-material';

interface Stat {
  label: string;
  value: string | number;
  Icon: SvgIconComponent;
  onClick: () => void;
}

interface Props {
  itemsCount: number;
  outfitsCount: number;
  onItemsClick: () => void;
  onOutfitsClick: () => void;
}

export default function StatsGrid({ itemsCount, outfitsCount, onItemsClick, onOutfitsClick }: Props) {
  const STATS: Stat[] = [
    { label: 'Total Items', value: itemsCount, Icon: CheckroomIcon, onClick: onItemsClick },
    { label: 'Saved Outfits', value: outfitsCount, Icon: PaletteIcon, onClick: onOutfitsClick },
  ];

  return (
    <Grid container spacing={1.5}>
      {STATS.map(({ label, value, Icon, onClick }) => (
        <Grid key={label} size={{ xs: 6 }}>
          <Box
            component="button"
            onClick={onClick}
            sx={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              borderRadius: 3,
              p: 2.5,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'background-color 0.15s, border-color 0.15s',
              '&:hover': {
                bgcolor: PRIMARY_ALPHA[4],
                borderColor: 'primary.light',
              },
            }}
          >
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
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}
