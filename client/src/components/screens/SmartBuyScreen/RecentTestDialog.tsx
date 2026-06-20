import { Dialog, DialogContent, Box, Typography, IconButton, LinearProgress, Button, CircularProgress, TextField } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useState } from 'react';
import { GRADIENTS, SERIF_FONT } from '../../../styles/tokens';
import { imagesApi } from '../../../api/api/images.api';
import type { RecentTest } from './types';

interface Props {
  test: RecentTest;
  onClose: () => void;
  onAddToCloset: (test: RecentTest, name: string) => Promise<void>;
}

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function RecentTestDialog({ test, onClose, onAddToCloset }: Props) {
  const [namingStep, setNamingStep] = useState(false);
  const [customName, setCustomName] = useState(test.name);
  const [isAdding, setIsAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  const handleAdd = async () => {
    setIsAdding(true);
    try {
      await onAddToCloset(test, customName || test.name);
      setAddSuccess(true);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 4, p: 0, overflow: 'hidden' } } }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2.5, py: 2 }}>
        <IconButton size="small" onClick={onClose} sx={{ color: 'text.primary' }}>
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Typography sx={{ flex: 1, fontFamily: SERIF_FONT, fontWeight: 700, fontSize: 20 }} noWrap>
          {test.name}
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ px: 3, pt: 0, pb: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Image + stats row */}
        <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
          <Box
            sx={{
              width: 130, height: 130, flexShrink: 0,
              borderRadius: 3, overflow: 'hidden',
              bgcolor: 'action.hover',
            }}
          >
            <Box
              component="img"
              src={test.imageUrl}
              alt={test.name}
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Box>

          <Box sx={{ flex: 1, pt: 0.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Tested on {formatDate(test.testedAt)}
            </Typography>

            {/* % + label inline */}
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <Typography sx={{ fontFamily: SERIF_FONT, fontSize: 44, fontWeight: 700, color: 'primary.main', lineHeight: 1 }}>
                {test.compatibilityPct}%
              </Typography>
              <Typography variant="body1" color="text.secondary">Compatibility</Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={test.compatibilityPct}
              sx={{ borderRadius: 4, height: 8 }}
            />
          </Box>
        </Box>

        {/* Matching items */}
        {test.matchedItems.length > 0 && (
          <Box>
            <Typography sx={{ fontWeight: 500, fontSize: 17, mb: 2 }}>Matching Items from Your Closet</Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(test.matchedItems.length, 3)}, minmax(0, 1fr))`,
                gap: 1.5,
              }}
            >
              {test.matchedItems.slice(0, 3).map(({ item }) => (
                <Box key={item.id} sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  <Box
                    sx={{
                      height: 180,
                      borderRadius: 3,
                      overflow: 'hidden',
                      bgcolor: 'action.hover',
                    }}
                  >
                    <Box
                      component="img"
                      src={imagesApi.getImageUrl(item.imageId)}
                      alt={item.styles?.join(', ') ?? item.category?.name ?? 'Item'}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" noWrap sx={{ px: 0.5 }}>
                    {item.styles?.join(', ') ?? item.category?.name ?? 'Item'}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* CTA */}
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
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button variant="outlined" onClick={() => setNamingStep(false)} sx={{ flex: 1, borderRadius: 2, textTransform: 'none' }}>
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleAdd}
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
      </DialogContent>
    </Dialog>
  );
}
