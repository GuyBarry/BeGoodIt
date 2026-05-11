import { Box, Button, Chip, CircularProgress, LinearProgress, TextField, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useState } from 'react';
import { GRADIENTS, PRIMARY_ALPHA, SERIF_FONT } from '../../../styles/tokens';
import { imagesApi } from '../../../api/api/images.api';
import type { AnalysisResult as AnalysisResultType } from './types';

interface Props {
  testImage: string;
  testName: string;
  isAnalyzing: boolean;
  result: AnalysisResultType | null;
  isVirtualTryOn: boolean;
  isAdding: boolean;
  addSuccess: boolean;
  onToggleVirtualTryOn: () => void;
  onAddToCloset: (name: string) => void;
  onReset: () => void;
}

export default function AnalysisResult({
  testImage, testName, isAnalyzing, result,
  isVirtualTryOn, isAdding, addSuccess,
  onToggleVirtualTryOn, onAddToCloset, onReset,
}: Props) {
  const [namingStep, setNamingStep] = useState(false);
  const [customName, setCustomName] = useState(testName);
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 4, alignItems: 'start' }}>
      {/* Left — item image */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box
          sx={{
            position: 'relative',
            aspectRatio: '3/4',
            borderRadius: 4,
            overflow: 'hidden',
            bgcolor: 'action.hover',
            maxWidth: 420,
            mx: 'auto',
            width: '100%',
          }}
        >
          <Box
            component="img"
            src={testImage}
            alt={testName}
            sx={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          />

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
              <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                Analyzing compatibility...
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                Matching with your closet
              </Typography>
            </Box>
          )}

          {isVirtualTryOn && result && (
            <Chip
              label="Virtual Try-On"
              size="small"
              sx={{
                position: 'absolute', top: 12, left: 12,
                background: GRADIENTS.primary,
                color: '#fff', fontWeight: 600, fontSize: 11,
              }}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, maxWidth: 420, mx: 'auto', width: '100%' }}>
          <Button
            variant={isVirtualTryOn ? 'contained' : 'outlined'}
            startIcon={<CheckroomIcon />}
            onClick={onToggleVirtualTryOn}
            disabled={!result}
            sx={{ flex: 1, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Virtual Try-On
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={onReset}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            New Test
          </Button>
        </Box>
      </Box>

      {/* Right — analysis */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {isAnalyzing ? (
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Scanning your wardrobe...
            </Typography>
            <LinearProgress sx={{ borderRadius: 4 }} />
          </Box>
        ) : result ? (
          <>
            {/* Compatibility score */}
            <Box
              sx={{
                borderRadius: 3, p: 3,
                background: GRADIENTS.primarySubtle,
                border: '1px solid', borderColor: PRIMARY_ALPHA[15],
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Closet Compatibility
              </Typography>
              <Typography
                sx={{
                  fontFamily: SERIF_FONT,
                  fontSize: 64,
                  fontWeight: 600,
                  color: 'primary.main',
                  lineHeight: 1,
                  mb: 1,
                }}
              >
                {result.compatibilityPct}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={result.compatibilityPct}
                sx={{ borderRadius: 4, height: 6, mb: 1.5, bgcolor: PRIMARY_ALPHA[12] }}
              />
              <Typography variant="body2" color="text.secondary">
                This item matches well with{' '}
                <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  {result.matchedItems.length} items
                </Box>{' '}
                in your closet
              </Typography>
            </Box>

            {/* Outfit potential */}
            <Box
              sx={{
                borderRadius: 3, p: 2.5,
                border: '1px solid', borderColor: 'divider',
                display: 'flex', alignItems: 'center', gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 44, height: 44, borderRadius: 2, flexShrink: 0,
                  background: GRADIENTS.primary,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <AutoAwesomeIcon sx={{ color: '#fff', fontSize: 20 }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 22, lineHeight: 1.1 }}>
                  {result.outfitCount} new outfits possible
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Outfit potential with your wardrobe
                </Typography>
              </Box>
            </Box>

            {/* Best matches */}
            {result.matchedItems.length > 0 && (
              <Box>
                <Typography sx={{ fontWeight: 600, mb: 1.5 }}>Best Matches in Your Closet</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
                  {result.matchedItems.map(({ item, matchPct }) => (
                    <Box key={item.id} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box
                        sx={{
                          height: 160,
                          borderRadius: 2,
                          overflow: 'hidden',
                          bgcolor: 'action.hover',
                          border: '1px solid', borderColor: 'divider',
                        }}
                      >
                        <Box
                          component="img"
                          src={imagesApi.getImageUrl(item.imageId)}
                          alt={item.style ?? item.category?.name ?? 'Item'}
                          sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 0.5 }}>
                        <Typography variant="caption" noWrap sx={{ maxWidth: '60%' }}>
                          {item.style ?? item.category?.name ?? 'Item'}
                        </Typography>
                        <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700 }}>
                          {matchPct}%
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Add to closet CTA */}
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
                  fullWidth
                  autoFocus
                  label="Name in your closet"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && onAddToCloset(customName || testName)}
                />
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setNamingStep(false)}
                    sx={{ flex: 1, borderRadius: 2, textTransform: 'none' }}
                  >
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
                sx={{
                  borderRadius: 3, textTransform: 'none', fontWeight: 600, py: 1.5,
                  background: GRADIENTS.primary,
                }}
              >
                I Bought It — Add to Closet
              </Button>
            )}
          </>
        ) : null}
      </Box>
    </Box>
  );
}
