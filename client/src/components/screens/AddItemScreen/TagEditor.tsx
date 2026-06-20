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
  const ALL_SEASON = 'All-Season';

  // Toggle for color/season — enforces minimum 1 selected
  const toggleItem = <T extends { id: number }>(arr: T[], item: T): T[] => {
    const isSelected = arr.some(x => x.id === item.id);
    if (isSelected && arr.length === 1) return arr; // keep at least one
    return isSelected ? arr.filter(x => x.id !== item.id) : [...arr, item];
  };

  // Season toggle with All-Season exclusivity logic
  const toggleSeason = (item: Season): Season[] => {
    const isSelected = tags.seasons.some(s => s.id === item.id);
    if (isSelected && tags.seasons.length === 1) return tags.seasons; // keep at least one
    if (isSelected) return tags.seasons.filter(s => s.id !== item.id);
    // Selecting All-Season → deselect everything else; selecting other → deselect All-Season
    if (item.name === ALL_SEASON) return [item];
    return [item, ...tags.seasons.filter(s => s.name !== ALL_SEASON)];
  };

  // Toggle for style — enforces minimum 1 selected
  const toggleStyle = (style: string): string[] => {
    const isSelected = tags.styles.includes(style);
    if (isSelected && tags.styles.length === 1) return tags.styles; // keep at least one
    return isSelected ? tags.styles.filter(s => s !== style) : [...tags.styles, style];
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h5" sx={{ fontFamily: SERIF_FONT, mb: 3 }}>Adjust Tags</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

          {/* Category — single select */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1.5 }}>
              Category
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {categories.map(item => (
                <Chip
                  key={item.id}
                  label={item.name}
                  onClick={() => onTagChange({ category: categories.find(c => c.id === item.id) ?? null })}
                  color={tags.category?.id === item.id ? 'primary' : 'default'}
                  variant={tags.category?.id === item.id ? 'filled' : 'outlined'}
                  sx={{ borderRadius: 2 }}
                />
              ))}
            </Box>
          </Box>

          {/* Color — multi-select, min 1 */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1.5 }}>
              Color
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {colors.map(item => {
                const selected = tags.colors.some(c => c.id === item.id);
                return (
                  <Chip
                    key={item.id}
                    label={item.name}
                    onClick={() => onTagChange({ colors: toggleItem(tags.colors, item) })}
                    color={selected ? 'primary' : 'default'}
                    variant={selected ? 'filled' : 'outlined'}
                    sx={{ borderRadius: 2 }}
                  />
                );
              })}
            </Box>
          </Box>

          {/* Season — multi-select, min 1, All-Season exclusive */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1.5 }}>
              Season
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {seasons.map(item => {
                const selected = tags.seasons.some(s => s.id === item.id);
                return (
                  <Chip
                    key={item.id}
                    label={item.name}
                    onClick={() => onTagChange({ seasons: toggleSeason(item) })}
                    color={selected ? 'primary' : 'default'}
                    variant={selected ? 'filled' : 'outlined'}
                    sx={{ borderRadius: 2 }}
                  />
                );
              })}
            </Box>
          </Box>

          {/* Style — multi-select, min 1 */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1.5 }}>
              Style
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {STYLE_OPTIONS.map(s => {
                const selected = tags.styles.includes(s);
                return (
                  <Chip
                    key={s}
                    label={s}
                    onClick={() => onTagChange({ styles: toggleStyle(s) })}
                    color={selected ? 'primary' : 'default'}
                    variant={selected ? 'filled' : 'outlined'}
                    sx={{ borderRadius: 2 }}
                  />
                );
              })}
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
