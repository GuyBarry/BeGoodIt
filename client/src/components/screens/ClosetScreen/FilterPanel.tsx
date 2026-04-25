import { Box, Typography, Chip, Collapse } from '@mui/material';
import { CATEGORIES, COLORS, SEASONS } from './data';

interface Props {
  show: boolean;
  selectedCategory: string;
  onCategoryChange: (v: string) => void;
  selectedColor: string;
  onColorChange: (v: string) => void;
  selectedSeason: string;
  onSeasonChange: (v: string) => void;
}

const filterChipSx = (active: boolean) => ({
  fontWeight: 500,
  borderRadius: 2,
  ...(active
    ? { bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: 'primary.dark' } }
    : { bgcolor: 'action.hover', color: 'text.secondary', '&:hover': { bgcolor: 'action.selected' } }
  ),
});

export default function FilterPanel({
  show,
  selectedCategory, onCategoryChange,
  selectedColor,    onColorChange,
  selectedSeason,   onSeasonChange,
}: Props) {
  return (
    <Collapse in={show}>
      <Box
        sx={{
          mt: 3,
          p: 3,
          bgcolor: 'background.paper',
          borderRadius: 3,
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 3 }}>
          {([
            { label: 'Category', options: CATEGORIES, value: selectedCategory, onChange: onCategoryChange },
            { label: 'Color',    options: COLORS,      value: selectedColor,    onChange: onColorChange    },
            { label: 'Season',   options: SEASONS,     value: selectedSeason,   onChange: onSeasonChange   },
          ] as const).map(({ label, options, value, onChange }) => (
            <Box key={label}>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  fontWeight: 600,
                  color: 'text.disabled',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  mb: 1.5,
                }}
              >
                {label}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {options.map(opt => (
                  <Chip
                    key={opt}
                    label={opt}
                    size="small"
                    onClick={() => onChange(opt)}
                    sx={filterChipSx(value === opt)}
                  />
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Collapse>
  );
}
