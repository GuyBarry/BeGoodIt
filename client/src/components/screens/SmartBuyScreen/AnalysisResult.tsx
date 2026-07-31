import { Box, Button, CircularProgress, IconButton, LinearProgress, TextField, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import { useState, useEffect } from 'react';
import { GRADIENTS, PALETTE, SERIF_FONT } from '../../../styles/tokens';
import { imagesApi } from '../../../api/api/images.api';
import type { AnalysisResult as AnalysisResultType } from './types';

interface Props {
  testImage: string;
  testName: string;
  isAnalyzing: boolean;
  result: AnalysisResultType | null;
  tryOnImage: string | null;
  isTryingOn: boolean;
  isAdding: boolean;
  addSuccess: boolean;
  onVirtualTryOn: () => void;
  onAddToCloset: (name: string) => void;
  onReset: () => void;
}

export default function AnalysisResult({
  testImage, testName, isAnalyzing, result,
  tryOnImage, isTryingOn,
  isAdding, addSuccess,
  onVirtualTryOn, onAddToCloset, onReset,
}: Props) {
  const [namingStep, setNamingStep] = useState(false);
  const [customName, setCustomName] = useState(testName);

  useEffect(() => { setCustomName(testName); }, [testName]);

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '2fr 3fr' },
        alignItems: 'start',
        gap: 3,
      }}
    >
      {/* ── Left: product image + compatibility card ── */}
      <Box
        sx={{
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            position: 'relative',
          }}
        >
          <Box
            component="img"
            src={tryOnImage ?? testImage}
            alt={testName}
            sx={{ width: '100%', height: 'auto', display: 'block' }}
          />

          {/* Virtual Try-On badge */}
          {tryOnImage && (
            <Box
              sx={{
                position: 'absolute', top: 16, left: 16,
                background: GRADIENTS.primary,
                borderRadius: 20, px: 1.5, py: 0.5,
                display: 'flex', alignItems: 'center', gap: 0.5,
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 13, color: '#fff' }} />
              <Typography variant="caption" sx={{ color: '#fff', fontWeight: 700, letterSpacing: 0.2 }}>
                Virtual Try-On
              </Typography>
            </Box>
          )}

          {/* X button */}
          <IconButton
            onClick={onReset}
            size="small"
            sx={{
              position: 'absolute', top: 16, right: 16,
              bgcolor: 'rgba(255,255,255,0.92)',
              '&:hover': { bgcolor: '#fff' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>

          {/* Try-on generating overlay */}
          {isTryingOn && (
            <Box
              sx={{
                position: 'absolute', inset: 0,
                bgcolor: 'rgba(0,0,0,0.5)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 2,
              }}
            >
              <CircularProgress size={40} sx={{ color: '#fff' }} />
              <Typography sx={{ color: '#fff', fontWeight: 500 }}>Generating your look...</Typography>
            </Box>
          )}

          {/* Analyzing overlay */}
          {isAnalyzing && (
            <Box
              sx={{
                position: 'absolute', inset: 0,
                bgcolor: 'rgba(0,0,0,0.45)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 2,
              }}
            >
              <CircularProgress size={40} sx={{ color: '#fff' }} />
              <Typography sx={{ color: '#fff', fontWeight: 500 }}>Analyzing compatibility...</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)' }}>Matching with your closet</Typography>
            </Box>
          )}
        </Box>

        {/* Compatibility card below image */}
        {result && (
          <Box
            sx={{
              bgcolor: 'background.paper',
              p: 2.5,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 17 }}>Closet Compatibility</Typography>
              <Typography sx={{ fontFamily: SERIF_FONT, fontSize: 32, fontWeight: 700, color: 'primary.main', lineHeight: 1 }}>
                {result.compatibilityPct}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={result.compatibilityPct}
              sx={{ borderRadius: 4, height: 8, mb: 1.5 }}
            />
            <Typography variant="body2" color="text.secondary">
              This item matches well with{' '}
              <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>{result.matchedItems.length} items</Box>
              {' '}in your closet and enables{' '}
              <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>{result.outfitCount} new outfits</Box>
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── Right: analysis content ── */}
      <Box sx={{ p: '8px', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {result && (
          <>
            {/* Best Matches */}
            {result.matchedItems.length > 0 && (
              <Box
                sx={{
                  border: '1px solid', borderColor: 'divider',
                  borderRadius: 3, p: 2.5,
                }}
              >
                <Typography sx={{ fontWeight: 700, fontSize: 18, mb: 2 }}>Best Matches in Your Closet</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(result.matchedItems.length, 4)}, minmax(0, 1fr))`, gap: 1.5 }}>
                  {result.matchedItems.slice(0, 4).map(({ item, matchPct }) => (
                    <Box key={item.id} sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                      <Box sx={{ position: 'relative', height: 120, borderRadius: 2, overflow: 'hidden', bgcolor: 'action.hover' }}>
                        <Box
                          component="img"
                          src={imagesApi.getImageUrl(item.imageId)}
                          alt={item.styles?.join(', ') ?? item.category?.name ?? 'Item'}
                          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        {/* % badge */}
                        <Box
                          sx={{
                            position: 'absolute', bottom: 8, right: 8,
                            bgcolor: 'rgba(255,255,255,0.95)',
                            borderRadius: 2, px: 1, py: 0.25,
                          }}
                        >
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>{matchPct}%</Typography>
                        </Box>
                      </Box>
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ px: 0.5 }}>
                        {item.styles?.join(', ') ?? item.category?.name ?? 'Item'}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Outfit Potential */}
            <Box
              sx={{
                border: '1px solid', borderColor: 'divider',
                borderRadius: 3, p: 3,
                textAlign: 'center',
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: 18, mb: 1.5 }}>Outfit Potential</Typography>
              <Typography sx={{ fontFamily: SERIF_FONT, fontSize: 52, fontWeight: 700, color: 'primary.main', lineHeight: 1 }}>
                {result.outfitCount}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>New Outfits Possible</Typography>
            </Box>

            {/* Buttons */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 'auto' }}>
              {!tryOnImage && (
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={isTryingOn ? <CircularProgress size={18} sx={{ color: PALETTE.primary }} /> : <AutoAwesomeIcon />}
                  onClick={onVirtualTryOn}
                  disabled={isTryingOn}
                  sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600, py: 1.5 }}
                >
                  {isTryingOn ? 'Generating...' : 'Virtual Try-On'}
                </Button>
              )}

              {addSuccess ? (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<CheckCircleIcon />}
                  disabled
                  sx={{
                    borderRadius: 3, textTransform: 'none', fontWeight: 600, py: 1.5,
                    bgcolor: 'success.main', color: '#fff',
                    '&.Mui-disabled': { bgcolor: 'success.main', color: '#fff' },
                  }}
                >
                  Added to Your Closet!
                </Button>
              ) : namingStep ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <TextField
                    fullWidth autoFocus
                    label="Name in your closet"
                    value={customName}
                    onChange={e => setCustomName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && onAddToCloset(customName || testName)}
                  />
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Button variant="outlined" onClick={() => setNamingStep(false)} sx={{ flex: 1, borderRadius: 2, textTransform: 'none' }}>
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => onAddToCloset(customName || testName)}
                      disabled={isAdding || !customName.trim()}
                      startIcon={isAdding ? <CircularProgress size={18} sx={{ color: 'inherit' }} /> : <AddShoppingCartIcon />}
                      sx={{ flex: 2, borderRadius: 2, textTransform: 'none', fontWeight: 600, background: GRADIENTS.primary }}
                    >
                      {isAdding ? 'Adding...' : 'Add to Closet'}
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddShoppingCartIcon />}
                  onClick={() => setNamingStep(true)}
                  sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600, py: 1.5, background: GRADIENTS.primary }}
                >
                  + I Bought It — Add to Closet
                </Button>
              )}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
