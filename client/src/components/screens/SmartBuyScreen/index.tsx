import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import { useAddClothingItem, useBodyImage, useClothingItems, useColorGroups, useGarmentCategories, useSeasons } from '../../../api';
import { fittingRoomApi } from '../../../api/api/fittingRoom.api';
import { imagesApi } from '../../../api/api/images.api';
import { smartBuyApi } from '../../../api/api/smartBuy.api';
import { useCurrentUser } from '../../../auth/AuthContext';
import { useScrollShadow } from '../../../hooks/useScrollShadow';
import PageHeader from '../../PageHeader';
import AnalysisResult from './AnalysisResult';
import RecentTestDialog from './RecentTestDialog';
import RecentTests from './RecentTests';
import type { AnalysisResult as AnalysisResultType, RecentTest } from './types';
import UploadPanel from './UploadPanel';

const MAX_RECENT = 6;


export default function SmartBuyScreen() {
  const currentUserId = useCurrentUser().id;
  const { data: clothingItems = [] } = useClothingItems(currentUserId);
  const { data: bodyImage, isLoading: isBodyImageLoading } = useBodyImage(currentUserId);
  const { mutateAsync: addToCloset } = useAddClothingItem(currentUserId);
  const { data: colorGroups = [] } = useColorGroups();
  const { data: garmentCategories = [] } = useGarmentCategories();
  const { data: seasons = [] } = useSeasons();

  const [testImage, setTestImage] = useState<string | null>(null);
  const [testFile, setTestFile] = useState<File | null>(null);
  const [testName, setTestName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResultType | null>(null);
  const [tryOnImage, setTryOnImage] = useState<string | null>(null);
  const [isTryingOn, setIsTryingOn] = useState(false);
  const [tryOnError, setTryOnError] = useState<string | null>(null);
  const [recentTests, setRecentTests] = useState<RecentTest[]>([]);

  useEffect(() => {
    smartBuyApi.getTests(currentUserId).then(records => {
      setRecentTests(records.map(r => ({
        id: r.id,
        imageUrl: r.imageId ? imagesApi.getImageUrl(r.imageId) : '',
        name: r.name,
        testedAt: new Date(r.testedAt),
        compatibilityPct: r.compatibilityPct,
        matchCount: r.matchCount,
        outfitCount: r.outfitCount,
        matchedItems: r.matchedItems
          .map(m => {
            const item = clothingItems.find(c => c.id === m.itemId);
            return item ? { item, matchPct: m.compatibilityPct } : null;
          })
          .filter((m): m is NonNullable<typeof m> => m !== null),
        classification: r.classification ?? undefined,
      })));
    }).catch(() => {});
  }, [clothingItems]);
  const [selectedRecentTest, setSelectedRecentTest] = useState<RecentTest | null>(null);
  const [testClassification, setTestClassification] = useState<{ category: string; colorGroups: string[]; seasons: string[]; styles: string[] } | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const { ref: mainRef, onScroll: onMainScroll, sx: scrollShadowSx } =
    useScrollShadow([testImage, isAnalyzing, result, recentTests.length]);

  const runAnalysis = async (imageUrl: string, name: string, file?: File) => {
    setTestImage(imageUrl);
    setTestFile(file ?? null);
    setTestName(name);
    setResult(null);
    setTryOnImage(null);
    setIsTryingOn(false);
    setTryOnError(null);
    setIsAdding(false);
    setAddSuccess(false);
    setIsAnalyzing(true);

    try {
      const imageFile = file ?? await fetch(imageUrl).then(r => r.blob()).then(b => new File([b], 'item.jpg', { type: b.type }));
      const response = await smartBuyApi.analyze(imageFile as File, currentUserId, name || undefined);

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

      const displayName = response.suggestedName || name;
      setTestName(displayName);

      const saved = await smartBuyApi.saveTest(currentUserId, file ?? null, {
        name: displayName,
        compatibilityPct: analysis.compatibilityPct,
        matchCount: analysis.matchedItems.length,
        outfitCount: analysis.outfitCount,
        matchedItems: response.matches,
        classification: response.uploadedClassification,
      }).catch(() => null);

      const entry: RecentTest = {
        id: saved?.id ?? crypto.randomUUID(),
        imageUrl: saved?.imageId ? imagesApi.getImageUrl(saved.imageId) : imageUrl,
        name: displayName,
        testedAt: new Date(),
        compatibilityPct: analysis.compatibilityPct,
        matchCount: analysis.matchedItems.length,
        outfitCount: analysis.outfitCount,
        matchedItems: analysis.matchedItems,
        classification: response.uploadedClassification,
      };

      setRecentTests(prev => [entry, ...prev.slice(0, MAX_RECENT - 1)]);
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
        userId: currentUserId,
        styles: testClassification?.styles ?? [],
        colorGroupIds: colorGroups
          .filter(c => testClassification?.colorGroups.includes(c.name))
          .map(c => c.id),
        categoryId: garmentCategories.find(c => c.name === testClassification?.category)?.id ?? null,
        seasonIds: seasons
          .filter(s => testClassification?.seasons.includes(s.name))
          .map(s => s.id),
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
      userId: currentUserId,
      styles: test.classification?.styles ?? [],
      colorGroupIds: colorGroups
        .filter(c => test.classification?.colorGroups.includes(c.name))
        .map(c => c.id),
      categoryId: garmentCategories.find(c => c.name === test.classification?.category)?.id ?? null,
      seasonIds: seasons
        .filter(s => test.classification?.seasons.includes(s.name))
        .map(s => s.id),
    });
  };

  const handleVirtualTryOn = async () => {
    let file = testFile;
    if (!file && testImage) {
      const blob = await fetch(testImage).then(r => r.blob());
      file = new File([blob], 'product.jpg', { type: blob.type });
    }
    if (!file) return;
    setIsTryingOn(true);
    setTryOnError(null);
    try {
      const parts = [
        testName,
        testClassification?.category,
        ...(testClassification?.colorGroups ?? []),
        ...(testClassification?.styles ?? []),
      ].filter(Boolean);
      const itemDescription = parts.length > 0 ? parts.join(', ') : undefined;
      const { url } = await fittingRoomApi.tryOnProduct(currentUserId, file, itemDescription);
      setTryOnImage(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : null;
      setTryOnError(message ?? 'Virtual try-on failed. Please try again.');
    } finally {
      setIsTryingOn(false);
    }
  };

  const handleReset = () => {
    setTestImage(null);
    setTestFile(null);
    setTestName('');
    setResult(null);
    setIsAnalyzing(false);
    setTryOnImage(null);
    setIsTryingOn(false);
    setTryOnError(null);
    setIsAdding(false);
    setAddSuccess(false);
    setTestClassification(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <PageHeader title="Smart Buy" subtitle="Test before you invest" />

      <Box component="main" sx={{ flex: 1, minHeight: 0, overflow: 'hidden', px: 4, py: 4 }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto', height: '100%' }}>
          {testImage || isAnalyzing ? (
            <AnalysisResult
              testImage={testImage!}
              testName={testName}
              isAnalyzing={isAnalyzing}
              result={result}
              tryOnImage={tryOnImage}
              isTryingOn={isTryingOn}
              tryOnError={tryOnError}
              isAdding={isAdding}
              addSuccess={addSuccess}
              hasBodyImage={!!bodyImage}
              isBodyImageLoading={isBodyImageLoading}
              onVirtualTryOn={handleVirtualTryOn}
              onAddToCloset={handleAddToCloset}
              onReset={handleReset}
            />
          ) : (
            <Box
              ref={mainRef}
              onScroll={onMainScroll}
              sx={{ height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 5, ...scrollShadowSx }}
            >
              <UploadPanel onAnalyze={runAnalysis} />
              <RecentTests tests={recentTests} onRetest={t => setSelectedRecentTest(t)} />
            </Box>
          )}
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
