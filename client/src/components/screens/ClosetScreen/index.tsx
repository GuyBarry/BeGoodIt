import { useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import ClosetHeader from './ClosetHeader';
import ClothingGrid from './ClothingGrid';
import OutfitsGrid from './OutfitsGrid';
import OutfitDialog from './OutfitDialog';
import { mockOutfits, type MockOutfit } from './data';
import { useClothingItems, useDeleteClothingItem } from '../../../api';

const CURRENT_USER_ID = '00000000-0000-0000-0000-000000000001';

export default function ClosetScreen() {
  const { data: clothingItems = [], isLoading } = useClothingItems(CURRENT_USER_ID);
  const { mutate: deleteItem } = useDeleteClothingItem(CURRENT_USER_ID);

  const [activeTab,        setActiveTab]        = useState<'clothes' | 'outfits'>('clothes');
  const [searchQuery,      setSearchQuery]      = useState('');
  const [showFilters,      setShowFilters]      = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedColor,    setSelectedColor]    = useState('All');
  const [selectedSeason,   setSelectedSeason]   = useState('All');
  const [gridSize,         setGridSize]         = useState<'normal' | 'compact'>('normal');
  const [selectedOutfit,   setSelectedOutfit]   = useState<MockOutfit | null>(null);

  const filteredClothes = clothingItems.filter(item => {
    const q    = searchQuery.toLowerCase();
    const name = (item.style || item.category?.name || '').toLowerCase();
    return (
      name.includes(q) &&
      (selectedCategory === 'All' || item.category?.name === selectedCategory) &&
      (selectedColor    === 'All' || item.colorGroup?.name === selectedColor) &&
      (selectedSeason   === 'All' || item.season?.name === selectedSeason)
    );
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <ClosetHeader
        activeTab={activeTab}           onTabChange={setActiveTab}
        searchQuery={searchQuery}       onSearchChange={setSearchQuery}
        showFilters={showFilters}       onFiltersToggle={() => setShowFilters(v => !v)}
        gridSize={gridSize}             onGridSizeChange={setGridSize}
        selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory}
        selectedColor={selectedColor}       onColorChange={setSelectedColor}
        selectedSeason={selectedSeason}     onSeasonChange={setSelectedSeason}
        itemsCount={clothingItems.length}
        outfitsCount={mockOutfits.length}
      />

      <Box component="main" sx={{ flex: 1, px: { xs: 2, sm: 4 }, py: 4 }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
          {activeTab === 'clothes' ? (
            isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : (
              <ClothingGrid items={filteredClothes} gridSize={gridSize} onDelete={deleteItem} />
            )
          ) : (
            <OutfitsGrid outfits={mockOutfits} gridSize={gridSize} onSelect={setSelectedOutfit} />
          )}
        </Box>
      </Box>

      <OutfitDialog outfit={selectedOutfit} onClose={() => setSelectedOutfit(null)} />
    </Box>
  );
}
