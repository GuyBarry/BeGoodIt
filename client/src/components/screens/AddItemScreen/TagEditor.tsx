import { Box, Button, Chip, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import type { ColorGroup, GarmentCategory, Season } from '../../../entities';
import { GRADIENTS, PRIMARY_ALPHA, SERIF_FONT } from '../../../styles/tokens';
import { STYLE_OPTIONS, type SelectedTags } from './types';

interface Props {
  categories: GarmentCategory[];
  colors: ColorGroup[];
  seasons: Season[];
  tags: SelectedTags;
  onTagChange: (patch: Partial<SelectedTags>) => void;
  onSave: () => void;
  isSaving: boolean;
}

export default function TagEditor({ categories, colors, seasons, tags, onTagChange, onSave, isSaving }: Props) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h5" sx={{ fontFamily: SERIF_FONT, mb: 3 }}>Adjust Tags</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

          {([
            { label: 'Category', items: categories, selectedId: tags.category?.id, onSelect: (id: number) => onTagChange({ category: categories.find(c => c.id === id) ?? null }) },
            { label: 'Color',    items: colors,     selectedId: tags.color?.id,    onSelect: (id: number) => onTagChange({ color:    colors.find(c => c.id === id) ?? null }) },
            { label: 'Season',   items: seasons,    selectedId: tags.season?.id,   onSelect: (id: number) => onTagChange({ season:   seasons.find(s => s.id === id) ?? null }) },
          ] as const).map(({ label, items, selectedId, onSelect }) => (
            <Box key={label}>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1.5 }}>
                {label}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {items.map(item => (
                  <Chip
                    key={item.id}
                    label={item.name}
                    onClick={() => onSelect(item.id)}
                    color={selectedId === item.id ? 'primary' : 'default'}
                    variant={selectedId === item.id ? 'filled' : 'outlined'}
                    sx={{ borderRadius: 2 }}
                  />
                ))}
              </Box>
            </Box>
          ))}

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1.5 }}>
              Style
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {STYLE_OPTIONS.map(s => (
                <Chip
                  key={s}
                  label={s}
                  onClick={() => onTagChange({ style: s })}
                  color={tags.style === s ? 'primary' : 'default'}
                  variant={tags.style === s ? 'filled' : 'outlined'}
                  sx={{ borderRadius: 2 }}
                />
              ))}
            </Box>
          </Box>

        </Box>
      </Box>

      <Button
        size="large"
        variant="contained"
        fullWidth
        startIcon={<CheckIcon />}
        onClick={onSave}
        disabled={isSaving}
        sx={{
          background: GRADIENTS.primary,
          color: '#fff',
          py: 1.75,
          borderRadius: 3,
          fontSize: 16,
          fontWeight: 500,
          boxShadow: `0 4px 20px ${PRIMARY_ALPHA[35]}`,
          '&:hover': { filter: 'brightness(1.08)', boxShadow: `0 6px 24px ${PRIMARY_ALPHA[45]}` },
        }}
      >
        {isSaving ? 'Uploading...' : 'Add to Closet'}
      </Button>
    </Box>
  );
}
