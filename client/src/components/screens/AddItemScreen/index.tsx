import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { useAddClothingItem, useColorGroups, useGarmentCategories, useSeasons } from '../../../api';
import { clothingItemsApi } from '../../../api/api/closet.api';
import { useCurrentUser } from '../../../auth/AuthContext';
import { useScrollShadow } from '../../../hooks/useScrollShadow';
import AddItemHeader from './AddItemHeader';
import UploadPanel from './UploadPanel';
import TipsCard from './TipsCard';
import TagEditor from './TagEditor';
import { EMPTY_TAGS, type SelectedTags } from './types';

export default function AddItemScreen() {
  const navigate = useNavigate();
  const currentUserId = useCurrentUser().id;
  const { data: categories = [] } = useGarmentCategories();
  const { data: colors = [] } = useColorGroups();
  const { data: seasons = [] } = useSeasons();
  const { mutate: addClothingItem, isPending: isUploading } = useAddClothingItem(currentUserId);

  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [tags, setTags] = useState<SelectedTags>(EMPTY_TAGS);
  const { ref: mainRef, onScroll: onMainScroll, sx: scrollShadowSx } =
    useScrollShadow([imageUrl, analysisComplete, saveSuccess]);

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
        colors: colors.filter(c => classification.colorGroups.includes(c.name)),
        seasons: seasons.filter(s => classification.seasons.includes(s.name)),
        styles: classification.styles.filter(s => s),
      });
    } catch (err) {
      console.error('[classify] failed:', err);
      setTags({
        category: categories[0] ?? null,
        colors: colors[0] ? [colors[0]] : [],
        seasons: seasons[0] ? [seasons[0]] : [],
        styles: [],
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
    setSaveSuccess(false);
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
        colorGroupIds: tags.colors.map(c => c.id),
        categoryId: tags.category?.id ?? null,
        seasonIds: tags.seasons.map(s => s.id),
        styles: tags.styles,
      },
      { onSuccess: () => setSaveSuccess(true) },
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {isUploading && (
        <Box sx={{
          position: 'absolute', inset: 0, zIndex: 10,
          bgcolor: 'rgba(255,255,255,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CircularProgress size={56} />
        </Box>
      )}
      <AddItemHeader />

      <Box
        component="main"
        ref={mainRef}
        onScroll={onMainScroll}
        sx={{ flex: 1, minHeight: 0, px: 4, py: 4, overflowY: 'auto', ...scrollShadowSx }}
      >
        {saveSuccess ? (
          <Box
            sx={{
              maxWidth: 480,
              mx: 'auto',
              mt: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              textAlign: 'center',
            }}
          >
            <Box sx={{ width: 72, height: 72, borderRadius: '50%', border: '3px solid', borderColor: 'success.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography sx={{ fontSize: 36, color: 'success.main', lineHeight: 1 }}>✓</Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>Item added successfully!</Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Button variant="outlined" size="large" onClick={() => navigate('/closet')}>
                Go to Closet
              </Button>
              <Button variant="contained" size="large" onClick={handleReset}>
                Add Another Item
              </Button>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 4, height: '100%' }}>

            <UploadPanel
              imageUrl={imageUrl}
              isAnalyzing={isAnalyzing}
              analysisComplete={analysisComplete}
              tags={tags}
              onFileSelect={handleFileSelect}
              onClear={handleReset}
            />

            <Box>
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
        )}
      </Box>
    </Box>
  );
}
