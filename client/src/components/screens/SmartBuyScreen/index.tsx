import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useClothingItems, useAddClothingItem, useColorGroups, useGarmentCategories, useSeasons } from '../../../api';
import UploadPanel from './UploadPanel';
import AnalysisResult from './AnalysisResult';
import RecentTests from './RecentTests';
import RecentTestDialog from './RecentTestDialog';
import type { AnalysisResult as AnalysisResultType, RecentTest } from './types';
import { smartBuyApi } from '../../../api/api/smartBuy.api';

const CURRENT_USER_ID = '00000000-0000-0000-0000-000000000001';
const STORAGE_KEY = 'smart-buy-recent-tests';
const MAX_RECENT = 6;

async function blobUrlToDataUrl(url: string): Promise<string> {
  if (!url.startsWith('blob:')) return url;
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function saveRecentTests(tests: RecentTest[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tests));
  } catch {
    // Storage full or unavailable — silently skip
  }
}

function loadRecentTests(): RecentTest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<RecentTest & { testedAt: string }>;
    return parsed.map(t => ({ ...t, testedAt: new Date(t.testedAt) }));
  } catch {
    return [];
  }
}


export default function SmartBuyScreen() {
  const { data: clothingItems = [] } = useClothingItems(CURRENT_USER_ID);
  const { mutateAsync: addToCloset } = useAddClothingItem(CURRENT_USER_ID);
  const { data: colorGroups = [] } = useColorGroups();
  const { data: garmentCategories = [] } = useGarmentCategories();
  const { data: seasons = [] } = useSeasons();

  const [testImage, setTestImage] = useState<string | null>(null);
  const [testFile, setTestFile] = useState<File | null>(null);
  const [testName, setTestName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResultType | null>(null);
  const [isVirtualTryOn, setIsVirtualTryOn] = useState(false);
  const [recentTests, setRecentTests] = useState<RecentTest[]>(() => loadRecentTests());
  const [selectedRecentTest, setSelectedRecentTest] = useState<RecentTest | null>(null);
  const [testClassification, setTestClassification] = useState<{ category: string; colorGroup: string; season: string; style: string } | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  const runAnalysis = async (imageUrl: string, name: string, file?: File) => {
    setTestImage(imageUrl);
    setTestFile(file ?? null);
    setTestName(name);
    setResult(null);
    setIsVirtualTryOn(false);
    setIsAdding(false);
    setAddSuccess(false);
    setIsAnalyzing(true);

    try {
      const imageFile = file ?? await fetch(imageUrl).then(r => r.blob()).then(b => new File([b], 'item.jpg', { type: b.type }));
      const response = await smartBuyApi.analyze(imageFile as File, CURRENT_USER_ID, name || undefined);

      const matchedItems = response.matches
        .map(m => {
          const item = clothingItems.find(c => c.id === m.itemId);
          return item ? { item, matchPct: m.compatibilityPct } : null;
        })
        .filter((m): m is { item: typeof clothingItems[0]; matchPct: number } => m !== null);

      const analysis: AnalysisResultType = {
        compatibilityPct: response.compatibilityPct,
        matchedItems,
        outfitCount: response.outfitCount,
      };

      setResult(analysis);
      setTestClassification(response.uploadedClassification);

      const persistedImageUrl = await blobUrlToDataUrl(imageUrl).catch(() => imageUrl);
      const entry: RecentTest = {
        id: crypto.randomUUID(),
        imageUrl: persistedImageUrl,
        name,
        testedAt: new Date(),
        compatibilityPct: analysis.compatibilityPct,
        matchCount: analysis.matchedItems.length,
        outfitCount: analysis.outfitCount,
        matchedItems: analysis.matchedItems,
        classification: response.uploadedClassification,
      };

      setRecentTests(prev => {
        const next = [entry, ...prev.slice(0, MAX_RECENT - 1)];
        saveRecentTests(next);
        return next;
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddToCloset = async (name: string) => {
    let file = testFile;

    if (!file && testImage) {
      try {
        const res = await fetch(testImage);
        const blob = await res.blob();
        file = new File([blob], `${name || 'item'}.jpg`, { type: blob.type || 'image/jpeg' });
      } catch {
        alert('Could not fetch the image. Try uploading it from your device instead.');
        return;
      }
    }

    if (!file) return;

    setIsAdding(true);
    try {
      await addToCloset({
        file,
        userId: CURRENT_USER_ID,
        style: name || undefined,
        colorGroupId: colorGroups.find(c => c.name === testClassification?.colorGroup)?.id ?? null,
        categoryId: garmentCategories.find(c => c.name === testClassification?.category)?.id ?? null,
        seasonId: seasons.find(s => s.name === testClassification?.season)?.id ?? null,
      });
      setAddSuccess(true);
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddRecentToCloset = async (test: RecentTest, name: string) => {
    const res = await fetch(test.imageUrl);
    const blob = await res.blob();
    const file = new File([blob], `${name || 'item'}.jpg`, { type: blob.type || 'image/jpeg' });
    await addToCloset({
      file,
      userId: CURRENT_USER_ID,
      style: name || undefined,
      colorGroupId: colorGroups.find(c => c.name === test.classification?.colorGroup)?.id ?? null,
      categoryId: garmentCategories.find(c => c.name === test.classification?.category)?.id ?? null,
      seasonId: seasons.find(s => s.name === test.classification?.season)?.id ?? null,
    });
  };

  const handleReset = () => {
    setTestImage(null);
    setTestFile(null);
    setTestName('');
    setResult(null);
    setIsAnalyzing(false);
    setIsVirtualTryOn(false);
    setIsAdding(false);
    setAddSuccess(false);
    setTestClassification(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box
        component="header"
        sx={{
          position: 'sticky', top: 0, zIndex: 40,
          bgcolor: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid', borderColor: 'divider',
          px: 4, py: 3,
        }}
      >
        <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
          <Typography variant="h4">Smart Buy</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            Test before you invest
          </Typography>
        </Box>
      </Box>

      <Box component="main" sx={{ flex: 1, px: 4, py: 4 }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 5 }}>
          {testImage || isAnalyzing ? (
            <AnalysisResult
              testImage={testImage!}
              testName={testName}
              isAnalyzing={isAnalyzing}
              result={result}
              isVirtualTryOn={isVirtualTryOn}
              isAdding={isAdding}
              addSuccess={addSuccess}
              onToggleVirtualTryOn={() => setIsVirtualTryOn(v => !v)}
              onAddToCloset={handleAddToCloset}
              onReset={handleReset}
            />
          ) : (
            <UploadPanel onAnalyze={runAnalysis} />
          )}

          {!testImage && !isAnalyzing && <RecentTests tests={recentTests} onRetest={t => setSelectedRecentTest(t)} />}
        </Box>
      </Box>

      {selectedRecentTest && (
        <RecentTestDialog
          test={selectedRecentTest}
          onClose={() => setSelectedRecentTest(null)}
          onAddToCloset={handleAddRecentToCloset}
        />
      )}
    </Box>
  );
}
