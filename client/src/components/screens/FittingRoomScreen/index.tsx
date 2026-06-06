import { useState } from 'react';
import { Box } from '@mui/material';
import FittingRoomHeader from './FittingRoomHeader';
import PreviewArea from './PreviewArea';
import ClosetItemGrid from './ClosetItemGrid';
import SelectedSummary from './SelectedSummary';
import GenerateButton from './GenerateButton';
import GetInspiredDialog from './GetInspiredDialog';
import { useClothingItems, useGenerateLook } from '../../../api';
import { useCurrentUser } from '../../../auth/AuthContext';

export default function FittingRoomScreen() {
  const currentUserId = useCurrentUser().id;
  const { data: clothingItems = [] } = useClothingItems(currentUserId);
  const { mutate: generateLook, isPending: isGenerating } = useGenerateLook();

  const [selectedItems, setSelectedItems]                     = useState<string[]>([]);
  const [generatedLookUrl, setGeneratedLookUrl]               = useState<string | null>(null);
  const [activeCategory, setActiveCategory]                   = useState('all');
  const [showInspireDialog, setShowInspireDialog]             = useState(false);
  const [inspirationImage, setInspirationImage]               = useState<string | null>(null);
  const [isAnalyzingInspiration, setIsAnalyzingInspiration]   = useState(false);
  const [suggestedItems, setSuggestedItems]                   = useState<string[]>([]);

  const toggleItem = (id: string) =>
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const handleGenerate = () => {
    if (selectedItems.length === 0) return;
    generateLook(
      { userId: currentUserId, clothingItemIds: selectedItems },
      {
        onSuccess: (url) => {
          if (generatedLookUrl) URL.revokeObjectURL(generatedLookUrl);
          setGeneratedLookUrl(url);
        },
      },
    );
  };

  const handleReset = () => {
    if (generatedLookUrl) URL.revokeObjectURL(generatedLookUrl);
    setSelectedItems([]);
    setGeneratedLookUrl(null);
    setSuggestedItems([]);
  };

  const handleFileSelect = (file: File) => {
    setInspirationImage(URL.createObjectURL(file));
  };

  const handleFindMatches = () => {
    if (!inspirationImage) return;
    setIsAnalyzingInspiration(true);
    setTimeout(() => {
      const suggested = clothingItems.slice(0, 3).map(i => i.id);
      setIsAnalyzingInspiration(false);
      setSuggestedItems(suggested);
      setSelectedItems(suggested);
      setShowInspireDialog(false);
    }, 2000);
  };

  const handleCloseInspireDialog = () => {
    setShowInspireDialog(false);
    setInspirationImage(null);
    setIsAnalyzingInspiration(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <FittingRoomHeader onGetInspired={() => setShowInspireDialog(true)} />

      <Box component="main" sx={{ flex: 1, px: 4, py: 4 }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 4 }}>
            <PreviewArea
              isGenerating={isGenerating}
              generatedLookUrl={generatedLookUrl}
              suggestedItems={suggestedItems}
              onReset={handleReset}
            />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <ClosetItemGrid
                clothingItems={clothingItems}
                selectedItems={selectedItems}
                suggestedItems={suggestedItems}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                onToggleItem={toggleItem}
              />
              <SelectedSummary selectedItems={selectedItems} clothingItems={clothingItems} />
              <GenerateButton
                selectedItems={selectedItems}
                isGenerating={isGenerating}
                onGenerate={handleGenerate}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      <GetInspiredDialog
        open={showInspireDialog}
        inspirationImage={inspirationImage}
        isAnalyzing={isAnalyzingInspiration}
        onClose={handleCloseInspireDialog}
        onFileSelect={handleFileSelect}
        onFindMatches={handleFindMatches}
        onClearImage={() => setInspirationImage(null)}
      />
    </Box>
  );
}
