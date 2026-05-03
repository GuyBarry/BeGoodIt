import { useState, useCallback } from 'react';
import { Box } from '@mui/material';
import { useColorGroups, useGarmentCategories, useSeasons, useUploadImage } from '../../../api';
import AddItemHeader from './AddItemHeader';
import UploadPanel from './UploadPanel';
import AvatarCard from './BodyImageCard';
import TipsCard from './TipsCard';
import TagEditor from './TagEditor';
import { EMPTY_TAGS, type SelectedTags } from './types';

// TODO: replace with real auth session user id
const CURRENT_USER_ID = '00000000-0000-0000-0000-000000000001';

export default function AddItemScreen() {
  const { data: categories = [] } = useGarmentCategories();
  const { data: colors = [] } = useColorGroups();
  const { data: seasons = [] } = useSeasons();
  const { mutate: uploadImage, isPending: isUploading } = useUploadImage();

  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [tags, setTags] = useState<SelectedTags>(EMPTY_TAGS);

  const handleFileSelect = useCallback((selected: File) => {
    setFile(selected);
    setImageUrl(URL.createObjectURL(selected));
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setTags(EMPTY_TAGS);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
      setTags({
        category: categories.find(c => c.name === 'Outerwear') ?? categories[0] ?? null,
        color: colors.find(c => c.name === 'Blue') ?? colors[0] ?? null,
        season: seasons.find(s => s.name === 'Fall') ?? seasons[0] ?? null,
        style: 'Smart Casual',
      });
    }, 2000);
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
    uploadImage(file, {
      onSuccess: (result) => {
        console.log('Uploaded:', result.id);
        // TODO: POST clothing item with result.id + tags once that endpoint exists
        handleReset();
      },
    });
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
                <>
                  <AvatarCard userId={CURRENT_USER_ID} />
                  <TipsCard />
                </>
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
