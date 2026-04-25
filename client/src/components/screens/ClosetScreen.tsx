import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  Collapse,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import GridViewIcon from '@mui/icons-material/GridView';
import AppsIcon from '@mui/icons-material/Apps';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CloseIcon from '@mui/icons-material/Close';
import { SERIF_FONT, GRADIENTS, PALETTE } from '../../styles/tokens';

interface MockClothingItem {
  id: number;
  name: string;
  category: string;
  color: string;
  season: string;
  image: string;
}

interface MockOutfitItem {
  id: number;
  name: string;
  image: string;
}

interface MockOutfit {
  id: number;
  name: string;
  image: string;
  clothingItems: MockOutfitItem[];
}

const mockClothes: MockClothingItem[] = [
  { id: 1, name: 'White Linen Shirt',     category: 'Tops',      color: 'White', season: 'Summer', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=300&h=400&fit=crop' },
  { id: 2, name: 'Navy Blazer',           category: 'Outerwear', color: 'Navy',  season: 'Fall',   image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop' },
  { id: 3, name: 'Black Jeans',           category: 'Bottoms',   color: 'Black', season: 'All',    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=300&h=400&fit=crop' },
  { id: 4, name: 'Cream Sweater',         category: 'Tops',      color: 'Cream', season: 'Winter', image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300&h=400&fit=crop' },
  { id: 5, name: 'Floral Dress',          category: 'Dresses',   color: 'Multi', season: 'Spring', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=400&fit=crop' },
  { id: 6, name: 'Brown Leather Jacket',  category: 'Outerwear', color: 'Brown', season: 'Fall',   image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=400&fit=crop' },
  { id: 7, name: 'Beige Chinos',          category: 'Bottoms',   color: 'Beige', season: 'All',    image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=300&h=400&fit=crop' },
  { id: 8, name: 'Striped T-Shirt',       category: 'Tops',      color: 'Multi', season: 'Summer', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=300&h=400&fit=crop' },
];

const mockOutfits: MockOutfit[] = [
  {
    id: 1,
    name: 'Casual Friday',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&h=400&fit=crop',
    clothingItems: [
      { id: 1, name: 'White Linen Shirt', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=150&h=200&fit=crop' },
      { id: 3, name: 'Black Jeans',       image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=150&h=200&fit=crop' },
      { id: 7, name: 'Beige Chinos',      image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=150&h=200&fit=crop' },
    ],
  },
  {
    id: 2,
    name: 'Date Night',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300&h=400&fit=crop',
    clothingItems: [
      { id: 2, name: 'Navy Blazer',           image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=200&fit=crop' },
      { id: 1, name: 'White Linen Shirt',     image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=150&h=200&fit=crop' },
      { id: 3, name: 'Black Jeans',           image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=150&h=200&fit=crop' },
      { id: 6, name: 'Brown Leather Jacket',  image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=150&h=200&fit=crop' },
    ],
  },
  {
    id: 3,
    name: 'Work Meeting',
    image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=300&h=400&fit=crop',
    clothingItems: [
      { id: 2, name: 'Navy Blazer',    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=200&fit=crop' },
      { id: 4, name: 'Cream Sweater',  image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=150&h=200&fit=crop' },
      { id: 7, name: 'Beige Chinos',   image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=150&h=200&fit=crop' },
    ],
  },
  {
    id: 4,
    name: 'Weekend Brunch',
    image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=300&h=400&fit=crop',
    clothingItems: [
      { id: 8, name: 'Striped T-Shirt',       image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=150&h=200&fit=crop' },
      { id: 7, name: 'Beige Chinos',          image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=150&h=200&fit=crop' },
      { id: 6, name: 'Brown Leather Jacket',  image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=150&h=200&fit=crop' },
    ],
  },
];

const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Accessories'];
const COLORS    = ['All', 'White', 'Black', 'Navy', 'Cream', 'Brown', 'Multi'];
const SEASONS   = ['All', 'Spring', 'Summer', 'Fall', 'Winter'];

export default function ClosetScreen() {
  const [activeTab,        setActiveTab]        = useState<'clothes' | 'outfits'>('clothes');
  const [searchQuery,      setSearchQuery]      = useState('');
  const [showFilters,      setShowFilters]      = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedColor,    setSelectedColor]    = useState('All');
  const [selectedSeason,   setSelectedSeason]   = useState('All');
  const [gridSize,         setGridSize]         = useState<'normal' | 'compact'>('normal');
  const [selectedOutfit,   setSelectedOutfit]   = useState<MockOutfit | null>(null);

  const filteredClothes = mockClothes.filter(item => {
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) &&
      (selectedCategory === 'All' || item.category === selectedCategory) &&
      (selectedColor    === 'All' || item.color    === selectedColor) &&
      (selectedSeason   === 'All' || item.season   === selectedSeason)
    );
  });

  const filterChipSx = (active: boolean) => ({
    fontWeight: 500,
    borderRadius: 2,
    ...(active
      ? { bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: 'primary.dark' } }
      : { bgcolor: 'action.hover', color: 'text.secondary', '&:hover': { bgcolor: 'action.selected' } }
    ),
  });

  const clothesGridCols = gridSize === 'normal'
    ? { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)', xl: 'repeat(5, 1fr)' }
    : { xs: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(6, 1fr)', xl: 'repeat(8, 1fr)' };

  const outfitsGridCols = gridSize === 'normal'
    ? { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }
    : { xs: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(6, 1fr)' };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* ── Header ── */}
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          bgcolor: alpha('#faf9f7', 0.95),
          backdropFilter: 'blur(20px)',
          borderBottom: 1,
          borderColor: 'divider',
          px: { xs: 2, sm: 4 },
          py: 3,
        }}
      >
        <Box sx={{ maxWidth: 1280, mx: 'auto' }}>

          {/* Title + controls row */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box>
              <Typography variant="h4" sx={{ fontFamily: SERIF_FONT, fontWeight: 600 }}>
                My Closet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {mockClothes.length} items · {mockOutfits.length} saved outfits
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Grid size toggle */}
              <Box sx={{ display: 'flex', bgcolor: 'action.hover', borderRadius: 1.5, p: 0.5 }}>
                {([
                  { value: 'normal',  Icon: GridViewIcon },
                  { value: 'compact', Icon: AppsIcon },
                ] as const).map(({ value, Icon }) => (
                  <IconButton
                    key={value}
                    size="small"
                    onClick={() => setGridSize(value)}
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

              {/* User avatar */}
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
                <Typography sx={{ color: '#fff', fontFamily: SERIF_FONT, fontSize: 20, fontWeight: 600, lineHeight: 1 }}>
                  S
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Search + filter button + tabs */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search your wardrobe..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
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
              onClick={() => setShowFilters(v => !v)}
              sx={{ height: 40, borderRadius: 2.5, textTransform: 'none', fontWeight: 500, flexShrink: 0 }}
            >
              Filters
            </Button>

            {/* Tabs */}
            <Box sx={{ display: 'flex', bgcolor: 'action.hover', borderRadius: 2.5, p: 0.5, ml: 'auto', flexShrink: 0 }}>
              {(['clothes', 'outfits'] as const).map(tab => (
                <Box
                  key={tab}
                  component="button"
                  onClick={() => setActiveTab(tab)}
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

          {/* Filters panel */}
          <Collapse in={showFilters}>
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
                  { label: 'Category', options: CATEGORIES, value: selectedCategory, onChange: setSelectedCategory },
                  { label: 'Color',    options: COLORS,      value: selectedColor,    onChange: setSelectedColor    },
                  { label: 'Season',   options: SEASONS,     value: selectedSeason,   onChange: setSelectedSeason   },
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

        </Box>
      </Box>

      {/* ── Main content ── */}
      <Box component="main" sx={{ flex: 1, px: { xs: 2, sm: 4 }, py: 4 }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto' }}>

          {activeTab === 'clothes' ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: clothesGridCols, gap: 3 }}>
              {filteredClothes.map(item => (
                <Box
                  key={item.id}
                  sx={{
                    position: 'relative',
                    bgcolor: 'background.paper',
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '& .card-overlay': { opacity: 0, transition: 'opacity 0.3s' },
                    '& .card-info':    { transform: 'translateY(100%)', transition: 'transform 0.3s' },
                    '& .delete-btn':   { opacity: 0, transition: 'opacity 0.3s' },
                    '& img':           { transition: 'transform 0.5s' },
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
                      '& .card-overlay': { opacity: 1 },
                      '& .card-info':    { transform: 'translateY(0)' },
                      '& .delete-btn':   { opacity: 1 },
                      '& img':           { transform: 'scale(1.05)' },
                    },
                  }}
                >
                  <Box sx={{ aspectRatio: '3/4', overflow: 'hidden', bgcolor: '#fff' }}>
                    <Box
                      component="img"
                      src={item.image}
                      alt={item.name}
                      sx={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                    />
                  </Box>

                  {/* Hover gradient overlay */}
                  <Box
                    className="card-overlay"
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent 60%)',
                      pointerEvents: 'none',
                    }}
                  />

                  {/* Name / category (slides up) */}
                  <Box
                    className="card-info"
                    sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 1.5 }}
                  >
                    <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: 11 }}>
                      {item.category}
                    </Typography>
                  </Box>

                  {/* Delete button */}
                  <IconButton
                    className="delete-btn"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: alpha('#fff', 0.85),
                      backdropFilter: 'blur(4px)',
                      color: 'error.main',
                      '&:hover': { bgcolor: 'error.main', color: '#fff' },
                    }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>

                  {/* Season badge */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 2,
                      bgcolor: alpha('#fff', 0.85),
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    <Typography sx={{ fontSize: 11, fontWeight: 500 }}>{item.season}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: outfitsGridCols, gap: 3 }}>
              {mockOutfits.map(outfit => (
                <Box
                  key={outfit.id}
                  component="button"
                  onClick={() => setSelectedOutfit(outfit)}
                  sx={{
                    position: 'relative',
                    bgcolor: 'background.paper',
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    textAlign: 'left',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '& img': { transition: 'transform 0.5s' },
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
                      '& img': { transform: 'scale(1.05)' },
                    },
                  }}
                >
                  <Box sx={{ aspectRatio: '3/4', overflow: 'hidden' }}>
                    <Box
                      component="img"
                      src={outfit.image}
                      alt={outfit.name}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </Box>

                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      p: 1.5,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                    }}
                  >
                    <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{outfit.name}</Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>{outfit.clothingItems.length} items</Typography>
                  </Box>

                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      bgcolor: alpha('#fff', 0.85),
                      backdropFilter: 'blur(4px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FavoriteIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                  </Box>
                </Box>
              ))}
            </Box>
          )}

        </Box>
      </Box>

      {/* ── Outfit detail dialog ── */}
      <Dialog
        open={!!selectedOutfit}
        onClose={() => setSelectedOutfit(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontFamily: SERIF_FONT, fontSize: 22, fontWeight: 600, pb: 1 }}>
          {selectedOutfit?.name}
        </DialogTitle>
        <DialogContent>
          {selectedOutfit && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ aspectRatio: '4/3', borderRadius: 3, overflow: 'hidden' }}>
                <Box
                  component="img"
                  src={selectedOutfit.image}
                  alt={selectedOutfit.name}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </Box>

              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Clothing Items in This Outfit
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                  {selectedOutfit.clothingItems.map(item => (
                    <Box key={item.id}>
                      <Box sx={{ aspectRatio: '3/4', borderRadius: 2, overflow: 'hidden', bgcolor: '#fff', mb: 1 }}>
                        <Box
                          component="img"
                          src={item.image}
                          alt={item.name}
                          sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      </Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      >
                        {item.name}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Button
                variant="outlined"
                fullWidth
                startIcon={<CloseIcon />}
                onClick={() => setSelectedOutfit(null)}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 500 }}
              >
                Close
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>

    </Box>
  );
}
