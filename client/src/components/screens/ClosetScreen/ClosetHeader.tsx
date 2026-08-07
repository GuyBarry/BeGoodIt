import { Box, Typography, TextField, InputAdornment, IconButton, Button } from '@mui/material';
import { alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import GridViewIcon from '@mui/icons-material/GridView';
import AppsIcon from '@mui/icons-material/Apps';
import { GRADIENTS, PALETTE, SERIF_FONT } from '../../../styles/tokens';
import { getInitials } from '../../../lib/initials';
import PageHeader from '../../PageHeader';
import FilterPanel from './FilterPanel';

interface Props {
  activeTab: 'clothes' | 'outfits';
  onTabChange: (tab: 'clothes' | 'outfits') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  showFilters: boolean;
  onFiltersToggle: () => void;
  gridSize: 'normal' | 'compact';
  onGridSizeChange: (size: 'normal' | 'compact') => void;
  selectedCategory: string;
  onCategoryChange: (v: string) => void;
  selectedColor: string;
  onColorChange: (v: string) => void;
  selectedSeason: string;
  onSeasonChange: (v: string) => void;
  selectedStyle: string;
  onStyleChange: (v: string) => void;
  itemsCount: number;
  outfitsCount: number;
  username: string;
}

export default function ClosetHeader({
  activeTab, onTabChange,
  searchQuery, onSearchChange,
  showFilters, onFiltersToggle,
  gridSize, onGridSizeChange,
  selectedCategory, onCategoryChange,
  selectedColor, onColorChange,
  selectedSeason, onSeasonChange,
  selectedStyle, onStyleChange,
  itemsCount, outfitsCount,
  username,
}: Props) {
  return (
    <PageHeader
      title="My Closet"
      subtitle={`${itemsCount} items · ${outfitsCount} saved outfits`}
      right={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', bgcolor: 'action.hover', borderRadius: 1.5, p: 0.5 }}>
            {([
              { value: 'normal',  Icon: GridViewIcon },
              { value: 'compact', Icon: AppsIcon },
            ] as const).map(({ value, Icon }) => (
              <IconButton
                key={value}
                size="small"
                onClick={() => onGridSizeChange(value)}
                sx={{
                  borderRadius: 1,
                  bgcolor: gridSize === value ? 'background.paper' : 'transparent',
                  boxShadow: gridSize === value ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                  transition: 'background 0.2s, box-shadow 0.2s',
                }}
              >
                <Icon fontSize="small" />
              </IconButton>
            ))}
          </Box>

          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: GRADIENTS.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Typography sx={{ color: '#fff', fontFamily: SERIF_FONT, fontSize: 18, fontWeight: 600, lineHeight: 1 }}>
              {getInitials(username)}
            </Typography>
          </Box>
        </Box>
      }
    >
      {/* Search + filter button + tabs */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mt: 3 }}>
        <TextField
          size="small"
          placeholder="Search your wardrobe..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            flex: 1,
            maxWidth: 400,
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: 'action.hover',
              '& fieldset': { border: 'none' },
              '&.Mui-focused fieldset': { border: `2px solid ${alpha(PALETTE.primary, 0.3)}` },
            },
          }}
        />

        <Button
          variant={showFilters ? 'contained' : 'outlined'}
          startIcon={<TuneIcon />}
          onClick={onFiltersToggle}
          sx={{ height: 40, borderRadius: 2.5, textTransform: 'none', fontWeight: 500, flexShrink: 0 }}
        >
          Filters
        </Button>

        <Box sx={{ display: 'flex', bgcolor: 'action.hover', borderRadius: 2.5, p: 0.5, ml: 'auto', flexShrink: 0 }}>
          {(['clothes', 'outfits'] as const).map(tab => (
            <Box
              key={tab}
              component="button"
              onClick={() => onTabChange(tab)}
              sx={{
                px: 3,
                py: 1,
                border: 'none',
                borderRadius: 2,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 14,
                fontWeight: 500,
                transition: 'all 0.2s',
                ...(activeTab === tab
                  ? { bgcolor: 'text.primary', color: 'background.paper' }
                  : { bgcolor: 'transparent', color: 'text.secondary', '&:hover': { bgcolor: alpha('#000', 0.05) } }
                ),
              }}
            >
              {tab === 'clothes' ? 'Clothes' : 'Saved Outfits'}
            </Box>
          ))}
        </Box>
      </Box>

      <FilterPanel
        show={showFilters}
        selectedCategory={selectedCategory} onCategoryChange={onCategoryChange}
        selectedColor={selectedColor}       onColorChange={onColorChange}
        selectedSeason={selectedSeason}     onSeasonChange={onSeasonChange}
        selectedStyle={selectedStyle}       onStyleChange={onStyleChange}
      />
    </PageHeader>
  );
}
