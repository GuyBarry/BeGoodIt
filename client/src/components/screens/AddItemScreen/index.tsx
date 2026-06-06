import { useState, useCallback } from 'react';
import { Box } from '@mui/material';
import { useAddClothingItem, useColorGroups, useGarmentCategories, useSeasons } from '../../../api';
import { clothingItemsApi } from '../../../api/api/closet.api';
import { useCurrentUser } from '../../../auth/AuthContext';
import AddItemHeader from './AddItemHeader';
import UploadPanel from './UploadPanel';
import TipsCard from './TipsCard';
import TagEditor from './TagEditor';
import { EMPTY_TAGS, type SelectedTags } from './types';

export default function AddItemScreen() {
  const currentUserId = useCurrentUser().id;
  const { data: categories = [] } = useGarmentCategories();
  const { data: colors = [] } = useColorGroups();
  const { data: seasons = [] } = useSeasons();
  const { mutate: addClothingItem, isPending: isUploading } = useAddClothingItem(currentUserId);

  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [tags, setTags] = useState<SelectedTags>(EMPTY_TAGS);

  const handleFileSelect = useCallback(async (selected: File) => {
    setFile(selected);
    setImageUrl(URL.createObjectURL(selected));
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setTags(EMPTY_TAGS);

    try {
      const classification = await clothingItemsApi.classify(selected);
      console.log('[classify] response:', classification);
      setTags({
        category: categories.find(c => c.name === classification.category) ?? null,
        color: colors.find(c => c.name === classification.colorGroup) ?? null,
        season: seasons.find(s => s.name === classification.season) ?? null,
        style: classification.style,
      });
    } catch (err) {
      console.error('[classify] failed:', err);
      setTags({
        category: categories[0] ?? null,
        color: colors[0] ?? null,
        season: seasons[0] ?? null,
        style: '',
      });
    } finally {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }
  }, [categories, colors, seasons]);

  const handleReset = () => {
    setFile(null);
    setImageUrl(null);
    setIsAnalyzing(false);
    setAnalysisComplete(false);
    setTags(EMPTY_TAGS);
  };

  const handleTagChange = (patch: Partial<SelectedTags>) =>
    setTags(prev => ({ ...prev, ...patch }));

  const handleSave = () => {
    if (!file) return;
    addClothingItem(
      {
        file,
        userId: currentUserId,
        colorGroupId: tags.color?.id ?? null,
        categoryId: tags.category?.id ?? null,
        seasonId: tags.season?.id ?? null,
        style: tags.style,
      },
      { onSuccess: handleReset },
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AddItemHeader />

      <Box component="main" sx={{ flex: 1, px: 4, py: 4 }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 4 }}>

            <UploadPanel
              imageUrl={imageUrl}
              isAnalyzing={isAnalyzing}
              analysisComplete={analysisComplete}
              tags={tags}
              onFileSelect={handleFileSelect}
              onClear={handleReset}
            />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {!analysisComplete ? (
                <TipsCard />
              ) : (
                <TagEditor
                  categories={categories}
                  colors={colors}
                  seasons={seasons}
                  tags={tags}
                  onTagChange={handleTagChange}
                  onSave={handleSave}
                  isSaving={isUploading}
                />
              )}
            </Box>

          </Box>
        </Box>
      </Box>
    </Box>
  );
}
