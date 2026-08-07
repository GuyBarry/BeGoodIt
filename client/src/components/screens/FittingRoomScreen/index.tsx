import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar } from '@mui/material';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBodyImage, useClothingItems, useFindMatches, useGenerateLook, useGetOutfits, useSaveOutfit } from '../../../api';
import { PRIMARY_ALPHA } from '../../../styles/tokens';
import ClosetItemGrid from './ClosetItemGrid';
import FittingRoomHeader from './FittingRoomHeader';
import GenerateButton from './GenerateButton';
import GettingStartedChecklist from './GettingStartedChecklist';
import EmptyClosetState from '../../EmptyClosetState';

import GetInspiredPanel from './GetInspiredPanel';
import PreviewArea from './PreviewArea';
import SelectedSummary from './SelectedSummary';
import { useCurrentUser } from '../../../auth/AuthContext';
import { useScrollShadow } from '../../../hooks/useScrollShadow';

export default function FittingRoomScreen() {
  const navigate = useNavigate();
  const currentUserId = useCurrentUser().id;
  const { data: clothingItems = [] } = useClothingItems(currentUserId);
  const { data: outfits = [] }        = useGetOutfits(currentUserId);
  const { data: bodyImage, isLoading: isBodyImageLoading } = useBodyImage(currentUserId);
  const { mutate: generateLook, isPending: isGenerating }             = useGenerateLook();
  const { mutate: saveOutfit,   isPending: isSaving, isSuccess: isSavedByMutation, reset: resetSaveOutfit } = useSaveOutfit();
  const { mutate: findMatches,  isPending: isAnalyzingInspiration }   = useFindMatches();

  const [selectedItems, setSelectedItems]     = useState<string[]>([]);
  const [generatedLookUrl, setGeneratedLookUrl] = useState<string | null>(null);
  const [generatedImageId, setGeneratedImageId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory]   = useState('all');
  const [activeTab, setActiveTab]             = useState<'closet' | 'inspired'>('closet');
  const [inspirationImage, setInspirationImage]   = useState<string | null>(null);
  const [inspirationFile, setInspirationFile]     = useState<File | null>(null);
  const [suggestedItems, setSuggestedItems]   = useState<string[]>([]);
  const [missingBodyImageOpen, setMissingBodyImageOpen] = useState(false);
  const [noMatchesSnackbarOpen, setNoMatchesSnackbarOpen] = useState(false);

  // If this exact set of clothing items was already saved as an outfit before, the freshly
  // generated (possibly cached) look is already saved, regardless of local mutation state.
  const isAlreadySavedOutfit = useMemo(() => {
    if (selectedItems.length === 0) return false;
    const selectedKey = [...selectedItems].sort().join(',');
    return outfits.some((outfit) => {
      if (!outfit.imageId) return false;
      const itemsKey = (outfit.items ?? []).map((item) => item.id).sort().join(',');
      return itemsKey === selectedKey;
    });
  }, [outfits, selectedItems]);

  const isSaved = isSavedByMutation || isAlreadySavedOutfit;
  const { ref: closetListRef, onScroll: onClosetListScroll, sx: closetScrollShadowSx } =
    useScrollShadow([clothingItems.length, activeCategory, activeTab]);

  const toggleItem = (id: string) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

    // Selection changed: any previously generated look no longer matches, so revert back
    // to the initial "Generate Look" state and drop the recreate/save controls.
    if (generatedLookUrl) {
      URL.revokeObjectURL(generatedLookUrl);
      setGeneratedLookUrl(null);
      setGeneratedImageId(null);
      resetSaveOutfit();
    }
  };

  const handleGenerate = (recreate = false) => {
    if (selectedItems.length === 0) return;
    generateLook(
      { userId: currentUserId, clothingItemIds: selectedItems, recreate },
      {
        onSuccess: ({ url, imageId }) => {
          if (generatedLookUrl) URL.revokeObjectURL(generatedLookUrl);
          setGeneratedLookUrl(url);
          setGeneratedImageId(imageId);
        },
        onError: (error: Error & { status?: number }) => {
          if (error.status === 404 && error.message.toLowerCase().includes('body photo')) {
            setMissingBodyImageOpen(true);
          }
        },
      },
    );
  };

  const handleRecreate = () => handleGenerate(true);

  const handleSave = () => {
    if (!generatedImageId) return;
    saveOutfit({ userId: currentUserId, imageId: generatedImageId, clothingItemIds: selectedItems });
  };

  const handleReset = () => {
    if (generatedLookUrl) URL.revokeObjectURL(generatedLookUrl);
    setSelectedItems([]);
    setGeneratedLookUrl(null);
    setGeneratedImageId(null);
    setSuggestedItems([]);
    resetSaveOutfit();
  };

  const handleFileSelect = (file: File) => {
    setInspirationImage(URL.createObjectURL(file));
    setInspirationFile(file);
  };

  const handleFindMatches = () => {
    if (!inspirationFile) return;
    findMatches(
      { userId: currentUserId, file: inspirationFile },
      {
        onSuccess: (matchedItemIds) => {
          setSuggestedItems(matchedItemIds);
          setSelectedItems(matchedItemIds);
          if (matchedItemIds.length === 0) {
            setNoMatchesSnackbarOpen(true);
          }
          setActiveTab('closet');
        },
      },
    );
  };

  const handleClearInspirationImage = () => {
    if (inspirationImage) URL.revokeObjectURL(inspirationImage);
    setInspirationImage(null);
    setInspirationFile(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {isGenerating && (
        <Box sx={{
          position: 'absolute', inset: 0, zIndex: 10,
          bgcolor: 'rgba(255,255,255,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CircularProgress size={56} />
        </Box>
      )}
      <FittingRoomHeader />

      <GettingStartedChecklist
        hasClothes={clothingItems.length > 0}
        hasBodyImage={!!bodyImage}
        hasOutfit={outfits.length > 0}
      />

      <Box component="main" sx={{ flex: 1, minHeight: 0, px: 4, py: 3, overflow: 'hidden' }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto', height: '100%' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 4, height: '100%' }}>
            <PreviewArea
              isGenerating={isGenerating}
              generatedLookUrl={generatedLookUrl}
              suggestedItems={suggestedItems}
              onReset={handleReset}
              isSaving={isSaving}
              isSaved={isSaved}
              onSave={handleSave}
            />

            {/* Right panel with tabs */}
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

              {/* Pill tab switcher */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2.5, p: 0.75, bgcolor: 'action.hover', borderRadius: 3 }}>
                {([{ id: 'closet', label: 'My Closet' }, { id: 'inspired', label: 'Get Inspired' }] as const).map(tab => (
                  <Box
                    key={tab.id}
                    component="button"
                    onClick={() => setActiveTab(tab.id)}
                    sx={{
                      flex: 1, py: 1, border: 'none', cursor: 'pointer', borderRadius: 2.5,
                      fontWeight: 600, fontSize: 13, fontFamily: 'inherit',
                      transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75,
                      ...(activeTab === tab.id
                        ? { bgcolor: 'background.paper', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', color: 'text.primary' }
                        : { bgcolor: 'transparent', color: 'text.secondary' }
                      ),
                    }}
                  >
                    {tab.id === 'closet'
                      ? <><CheckroomIcon sx={{ fontSize: 16 }} /> {tab.label}{suggestedItems.length > 0 && <Box component="span" sx={{ ml: 0.5, px: 0.75, py: 0.1, bgcolor: PRIMARY_ALPHA[15], color: 'primary.main', borderRadius: 5, fontSize: 11 }}>{suggestedItems.length}</Box>}</>
                      : <><AutoAwesomeIcon sx={{ fontSize: 16 }} /> {tab.label}</>}
                  </Box>
                ))}
              </Box>

              {/* Closet tab */}
              {activeTab === 'closet' && (
                clothingItems.length === 0 ? (
                  <Box sx={{ flex: 1, overflowY: 'auto' }}>
                    <EmptyClosetState
                      title="Your fitting room is feeling a little too roomy"
                      subtitle="You don't have any clothes to try on yet. Add some items to your closet and come back to play dress-up."
                    />
                  </Box>
                ) : (
                  <>
                    <Box
                      ref={closetListRef}
                      onScroll={onClosetListScroll}
                      sx={{
                        flex: 1,
                        minHeight: 0,
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3,
                        pr: 1,
                        pb: 2,
                        ...closetScrollShadowSx,
                      }}
                    >
                      <ClosetItemGrid
                        clothingItems={clothingItems}
                        selectedItems={selectedItems}
                        suggestedItems={suggestedItems}
                        activeCategory={activeCategory}
                        onCategoryChange={setActiveCategory}
                        onToggleItem={toggleItem}
                      />
                    </Box>
                    <Box
                      sx={{
                        flexShrink: 0,
                        pt: 2,
                        mt: 1,
                        bgcolor: 'background.default',
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.5,
                      }}
                    >
                      {selectedItems.length > 0 && (
                        <Box sx={{ maxHeight: 110, overflowY: 'auto' }}>
                          <SelectedSummary
                            selectedItems={selectedItems}
                            clothingItems={clothingItems}
                          />
                        </Box>
                      )}
                      {!isBodyImageLoading && !bodyImage && (
                        <Alert
                          severity="info"
                          variant="outlined"
                          action={
                            <Button
                              size="small"
                              startIcon={<PhotoCameraIcon fontSize="small" />}
                              onClick={() => navigate('/body')}
                              sx={{ textTransform: 'none', fontWeight: 600 }}
                            >
                              Add Photo
                            </Button>
                          }
                        >
                          Add a body photo to see yourself in this look.
                        </Alert>
                      )}
                      <GenerateButton
                        selectedItems={selectedItems}
                        isGenerating={isGenerating}
                        onGenerate={handleGenerate}
                        hasGeneratedLook={!!generatedLookUrl}
                        isSaving={isSaving}
                        isSaved={isSaved}
                        onSave={handleSave}
                        onRecreate={handleRecreate}
                      />
                    </Box>
                  </>
                )
              )}

              {/* Get Inspired tab */}
              {activeTab === 'inspired' && (
                <GetInspiredPanel
                  inspirationImage={inspirationImage}
                  isAnalyzing={isAnalyzingInspiration}
                  onFileSelect={handleFileSelect}
                  onFindMatches={handleFindMatches}
                  onClearImage={handleClearInspirationImage}
                />
              )}

            </Box>
          </Box>
        </Box>
      </Box>

      <Dialog open={missingBodyImageOpen} onClose={() => setMissingBodyImageOpen(false)}>
        <DialogTitle>Body Photo Required</DialogTitle>
        <DialogContent>
          <DialogContentText>
            We couldn't generate your look because you haven't uploaded a body photo yet. Upload one to get started.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMissingBodyImageOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => navigate('/body')}>Upload Body Photo</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={noMatchesSnackbarOpen}
        autoHideDuration={5000}
        onClose={() => setNoMatchesSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNoMatchesSnackbarOpen(false)}
          severity="info"
          variant="filled"
          sx={{ width: '100%' }}
        >
          No matching items found in your closet for this look. Browse your closet below to build your own outfit instead!
        </Alert>
      </Snackbar>

    </Box>
  );
}
