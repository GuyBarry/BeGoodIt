import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { keyframes } from '@emotion/react';
import ClosetHeader from './ClosetHeader';
import ClothingGrid from './ClothingGrid';
import OutfitsGrid from './OutfitsGrid';
import OutfitDialog from './OutfitDialog';
import { useCurrentUser } from '../../../auth/AuthContext';
import { useClosetItems, useDeleteClothingItem, useGetOutfits } from '../../../api';
import type { ClosetFilters } from '../../../api/api/closet.api';
import type { Outfit } from '../../../entities/outfit';

const bounce = keyframes`
  0%, 100% { transform: translateY(0); opacity: 0.35; }
  50%       { transform: translateY(-5px); opacity: 1; }
`;

function LoadingDots() {
  return (
    <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', justifyContent: 'center', py: 1 }}>
      {[0, 1, 2].map(i => (
        <Box
          key={i}
          sx={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            animation: `${bounce} 1.2s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </Box>
  );
}

export default function ClosetScreen() {
  const currentUser = useCurrentUser();
  const currentUserId = currentUser.id;
  const location = useLocation();
  const [activeTab,        setActiveTab]        = useState<'clothes' | 'outfits'>('clothes');
  const [searchQuery,      setSearchQuery]      = useState('');
  const [debouncedSearch,  setDebouncedSearch]  = useState('');
  const [showFilters,      setShowFilters]      = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedColor,    setSelectedColor]    = useState('All');
  const [selectedSeason,   setSelectedSeason]   = useState('All');
  const [selectedStyle,    setSelectedStyle]    = useState('All');
  const [gridSize,         setGridSize]         = useState<'normal' | 'compact'>('normal');
  const [selectedOutfit,   setSelectedOutfit]   = useState<Outfit | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const tab = (location.state as { tab?: 'clothes' | 'outfits' } | null)?.tab;
    if (tab === 'clothes' || tab === 'outfits') {
      setActiveTab(tab);
    }
  }, [location.state]);

  const limit = gridSize === 'compact' ? 40 : 20;

  const filters: ClosetFilters = {
    ...(debouncedSearch            && { search:   debouncedSearch }),
    ...(selectedCategory !== 'All' && { category: selectedCategory }),
    ...(selectedColor    !== 'All' && { color:    selectedColor }),
    ...(selectedSeason   !== 'All' && { season:   selectedSeason }),
    ...(selectedStyle    !== 'All' && { style:    selectedStyle }),
    limit,
  };

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, resetToFirstPage } =
    useClosetItems(currentUserId, filters);
  const { mutate: deleteItem } = useDeleteClothingItem(currentUserId);
  const { data: outfits = [], isLoading: outfitsLoading } = useGetOutfits(currentUserId);

  const items = data?.pages.flatMap(p => p.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  const allLoaded = !hasNextPage && items.length > 0;
  const showLess  = allLoaded && items.length > limit;

  const outfitMatchesSearch = (outfit: Outfit, query: string) => {
    const q = query.toLowerCase();
    if (outfit.name?.toLowerCase().includes(q)) return true;
    return (outfit.items ?? []).some(item =>
      item.category?.name.toLowerCase().includes(q) ||
      item.colorGroups?.some(c => c.name.toLowerCase().includes(q)) ||
      item.seasons?.some(s => s.name.toLowerCase().includes(q)) ||
      item.styles?.some(s => s.toLowerCase().includes(q)),
    );
  };

  const filteredOutfits = outfits.filter(outfit => {
    if (debouncedSearch && !outfitMatchesSearch(outfit, debouncedSearch)) return false;
    const outfitItems = outfit.items ?? [];
    if (selectedCategory !== 'All' && !outfitItems.some(i => i.category?.name === selectedCategory)) return false;
    if (selectedColor    !== 'All' && !outfitItems.some(i => i.colorGroups?.some(c => c.name === selectedColor))) return false;
    if (selectedSeason   !== 'All' && !outfitItems.some(i => i.seasons?.some(s => s.name === selectedSeason))) return false;
    if (selectedStyle    !== 'All' && !outfitItems.some(i => i.styles?.includes(selectedStyle))) return false;
    return true;
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <ClosetHeader
        activeTab={activeTab}               onTabChange={setActiveTab}
        searchQuery={searchQuery}           onSearchChange={setSearchQuery}
        showFilters={showFilters}           onFiltersToggle={() => setShowFilters(v => !v)}
        gridSize={gridSize}                 onGridSizeChange={setGridSize}
        selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory}
        selectedColor={selectedColor}       onColorChange={setSelectedColor}
        selectedSeason={selectedSeason}     onSeasonChange={setSelectedSeason}
        selectedStyle={selectedStyle}       onStyleChange={setSelectedStyle}
        itemsCount={total}
        outfitsCount={outfits.length}
        username={currentUser.username}
      />

      <Box component="main" sx={{ flex: 1, px: { xs: 2, sm: 4 }, py: 4 }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
          {activeTab === 'clothes' ? (
            isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <ClothingGrid items={items} gridSize={gridSize} onDelete={deleteItem} />

                {items.length > 0 && (
                  <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Showing {items.length} of {total} items
                    </Typography>

                    {isFetchingNextPage ? (
                      <LoadingDots />
                    ) : showLess ? (
                      <Button
                        variant="outlined"
                        onClick={resetToFirstPage}
                        sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 500, px: 4 }}
                      >
                        Show less
                      </Button>
                    ) : hasNextPage ? (
                      <Button
                        variant="outlined"
                        onClick={() => fetchNextPage()}
                        sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 500, px: 4 }}
                      >
                        Load more
                      </Button>
                    ) : null}
                  </Box>
                )}
              </>
            )
          ) : outfitsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <OutfitsGrid outfits={filteredOutfits} gridSize={gridSize} onSelect={setSelectedOutfit} />
          )}
        </Box>
      </Box>

      <OutfitDialog outfit={selectedOutfit} onClose={() => setSelectedOutfit(null)} />
    </Box>
  );
}
