import { useState, useCallback } from 'react';
import { Box, Button, Chip, Paper, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckIcon from '@mui/icons-material/Check';
import ImageUploadArea from '../common/ImageUploadArea';
import { useColorGroups, useGarmentCategories, useSeasons } from '../../api';
import { GRADIENTS, PRIMARY_ALPHA, SERIF_FONT } from '../../styles/tokens';
import type { ColorGroup, GarmentCategory, Season } from '../../entities';

const STYLE_OPTIONS = ['Casual', 'Formal', 'Smart Casual', 'Sporty', 'Bohemian'];

interface SelectedTags {
  category: GarmentCategory | null;
  color: ColorGroup | null;
  season: Season | null;
  style: string | null;
}

const EMPTY_TAGS: SelectedTags = { category: null, color: null, season: null, style: null };

export default function AddItemScreen() {
  const { data: categories = [] } = useGarmentCategories();
  const { data: colors = [] } = useColorGroups();
  const { data: seasons = [] } = useSeasons();

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [tags, setTags] = useState<SelectedTags>(EMPTY_TAGS);

  const handleFileSelect = useCallback((file: File) => {
    setImageUrl(URL.createObjectURL(file));
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setTags(EMPTY_TAGS);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
      setTags({
        category: categories[4] ?? categories[0] ?? null,
        color: categories[3] ?? colors[0] ?? null,
        season: seasons[2] ?? seasons[0] ?? null,
        style: 'Smart Casual',
      });
    }, 2000);
  }, [categories, colors, seasons]);

  const handleReset = () => {
    setImageUrl(null);
    setIsAnalyzing(false);
    setAnalysisComplete(false);
    setTags(EMPTY_TAGS);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box
        component="header"
        sx={{
          position: 'sticky', top: 0, zIndex: 40,
          bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid', borderColor: 'divider',
          px: 4, py: 3,
        }}
      >
        <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
          <Typography variant="h4">Add to Closet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            Upload a garment and let AI tag it automatically
          </Typography>
        </Box>
      </Box>

      <Box component="main" sx={{ flex: 1, px: 4, py: 4 }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 4 }}>

            {/* LEFT — upload + analysis summary */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <ImageUploadArea
                imageUrl={imageUrl}
                isProcessing={isAnalyzing}
                processingLabel="Analyzing your item..."
                processingSubLabel="AI is detecting attributes"
                aspectRatio="4/5"
                onFileSelect={handleFileSelect}
                onClear={handleReset}
              />

              {analysisComplete && (
                <Paper elevation={0} sx={{ borderRadius: 3, p: 2.5, border: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: 'success.main' }}>
                    <CheckCircleIcon fontSize="small" />
                    <Typography sx={{ fontWeight: 500 }}>Analysis Complete</Typography>
                  </Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                    {([
                      { label: 'Category', value: tags.category?.name },
                      { label: 'Color', value: tags.color?.name },
                      { label: 'Season', value: tags.season?.name },
                      { label: 'Style', value: tags.style },
                    ] as const).map(({ label, value }) => value && (
                      <Box key={label} sx={{ bgcolor: 'action.hover', borderRadius: 2, px: 2, py: 1.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {label}
                        </Typography>
                        <Typography sx={{ fontWeight: 500, mt: 0.25 }}>{value}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              )}
            </Box>

            {/* RIGHT — tips before upload, tag editor after */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {!analysisComplete ? (
                <>
                  <Paper elevation={0} sx={{ borderRadius: 3, p: 3, border: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', gap: 2.5 }}>
                      <Box sx={{
                        width: 64, height: 64, borderRadius: 3, flexShrink: 0,
                        background: GRADIENTS.primarySubtle,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <AutoAwesomeIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                      </Box>
                      <Box>
                        <Typography variant="h6">Create Your Avatar</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          Upload 3–5 full-body photos to enable virtual try-on. AI will create a digital version of you for realistic outfit previews.
                        </Typography>
                        <Button disabled size="small" sx={{ mt: 1.5, borderRadius: 2, textTransform: 'none' }}>
                          Coming Soon
                        </Button>
                      </Box>
                    </Box>
                  </Paper>

                  <Paper elevation={0} sx={{ borderRadius: 3, p: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 2 }}>
                      Tips for best results
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {[
                        'Use good lighting and a plain background for clear visibility',
                        'Capture the full garment in frame without cropping',
                        'Lay flat or hang for best shape recognition by AI',
                      ].map((tip, i) => (
                        <Box key={i} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                          <Box sx={{
                            width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                            bgcolor: PRIMARY_ALPHA[10],
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>{i + 1}</Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ pt: 0.25 }}>{tip}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </>
              ) : (
                <>
                  <Box>
                    <Typography variant="h5" sx={{ fontFamily: SERIF_FONT, mb: 3 }}>Adjust Tags</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {([
                        { label: 'Category', items: categories, selected: tags.category?.id, onSelect: (id: number) => setTags(t => ({ ...t, category: categories.find(c => c.id === id) ?? null })) },
                        { label: 'Color',    items: colors,     selected: tags.color?.id,    onSelect: (id: number) => setTags(t => ({ ...t, color:    colors.find(c => c.id === id) ?? null })) },
                        { label: 'Season',   items: seasons,    selected: tags.season?.id,   onSelect: (id: number) => setTags(t => ({ ...t, season:   seasons.find(s => s.id === id) ?? null })) },
                      ] as const).map(({ label, items, selected, onSelect }) => (
                        <Box key={label}>
                          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1.5 }}>
                            {label}
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {items.map(item => (
                              <Chip
                                key={item.id}
                                label={item.name}
                                onClick={() => onSelect(item.id)}
                                color={selected === item.id ? 'primary' : 'default'}
                                variant={selected === item.id ? 'filled' : 'outlined'}
                                sx={{ borderRadius: 2 }}
                              />
                            ))}
                          </Box>
                        </Box>
                      ))}

                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1.5 }}>
                          Style
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {STYLE_OPTIONS.map(s => (
                            <Chip
                              key={s}
                              label={s}
                              onClick={() => setTags(t => ({ ...t, style: s }))}
                              color={tags.style === s ? 'primary' : 'default'}
                              variant={tags.style === s ? 'filled' : 'outlined'}
                              sx={{ borderRadius: 2 }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  <Button
                    size="large"
                    variant="contained"
                    fullWidth
                    startIcon={<CheckIcon />}
                    sx={{
                      background: GRADIENTS.primary,
                      color: '#fff',
                      py: 1.75,
                      borderRadius: 3,
                      fontSize: 16,
                      fontWeight: 500,
                      boxShadow: `0 4px 20px ${PRIMARY_ALPHA[35]}`,
                      '&:hover': { filter: 'brightness(1.08)', boxShadow: `0 6px 24px ${PRIMARY_ALPHA[45]}` },
                    }}
                  >
                    Add to Closet
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
