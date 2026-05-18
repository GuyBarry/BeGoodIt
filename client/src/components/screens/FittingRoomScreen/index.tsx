import { useState } from 'react';
import { Box } from '@mui/material';
import FittingRoomHeader from './FittingRoomHeader';
import PreviewArea from './PreviewArea';
import ClosetItemGrid from './ClosetItemGrid';
import SelectedSummary from './SelectedSummary';
import GenerateButton from './GenerateButton';
import GetInspiredDialog from './GetInspiredDialog';
import { useClothingItems, useGenerateLook, useSaveOutfit, useFindMatches } from '../../../api';

const CURRENT_USER_ID = '00000000-0000-0000-0000-000000000001';

export default function FittingRoomScreen() {
  const { data: clothingItems = [] } = useClothingItems(CURRENT_USER_ID);
  const { mutate: generateLook, isPending: isGenerating }             = useGenerateLook();
  const { mutate: saveOutfit,   isPending: isSaving, isSuccess: isSaved } = useSaveOutfit();
  const { mutate: findMatches,  isPending: isAnalyzingInspiration }   = useFindMatches();

  const [selectedItems, setSelectedItems]     = useState<string[]>([]);
  const [generatedLookUrl, setGeneratedLookUrl] = useState<string | null>(null);
  const [generatedImageId, setGeneratedImageId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory]   = useState('all');
  const [showInspireDialog, setShowInspireDialog] = useState(false);
  const [inspirationImage, setInspirationImage]   = useState<string | null>(null);
  const [inspirationFile, setInspirationFile]     = useState<File | null>(null);
  const [suggestedItems, setSuggestedItems]   = useState<string[]>([]);

  const toggleItem = (id: string) =>
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const handleGenerate = () => {
    if (selectedItems.length === 0) return;
    generateLook(
      { userId: CURRENT_USER_ID, clothingItemIds: selectedItems },
      {
        onSuccess: ({ url, imageId }) => {
          if (generatedLookUrl) URL.revokeObjectURL(generatedLookUrl);
          setGeneratedLookUrl(url);
          setGeneratedImageId(imageId);
        },
      },
    );
  };

  const handleSave = () => {
    if (!generatedImageId) return;
    saveOutfit({ userId: CURRENT_USER_ID, imageId: generatedImageId, clothingItemIds: selectedItems });
  };

  const handleReset = () => {
    if (generatedLookUrl) URL.revokeObjectURL(generatedLookUrl);
    setSelectedItems([]);
    setGeneratedLookUrl(null);
    setGeneratedImageId(null);
    setSuggestedItems([]);
  };

  const handleFileSelect = (file: File) => {
    setInspirationImage(URL.createObjectURL(file));
    setInspirationFile(file);
  };

  const handleFindMatches = () => {
    if (!inspirationFile) return;
    findMatches(
      { userId: CURRENT_USER_ID, file: inspirationFile },
      {
        onSuccess: (matchedItemIds) => {
          setSuggestedItems(matchedItemIds);
          setSelectedItems(matchedItemIds);
          setShowInspireDialog(false);
        },
      },
    );
  };

  const handleCloseInspireDialog = () => {
    setShowInspireDialog(false);
    if (inspirationImage) URL.revokeObjectURL(inspirationImage);
    setInspirationImage(null);
    setInspirationFile(null);
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
              isSaving={isSaving}
              isSaved={isSaved}
              suggestedItems={suggestedItems}
              onSave={handleSave}
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
        onClearImage={() => {
          if (inspirationImage) URL.revokeObjectURL(inspirationImage);
          setInspirationImage(null);
          setInspirationFile(null);
        }}
      />
    </Box>
  );
}
