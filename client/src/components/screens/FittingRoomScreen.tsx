import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  IconButton,
  Paper,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ImageIcon from '@mui/icons-material/Image';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import UploadIcon from '@mui/icons-material/Upload';
import CloseIcon from '@mui/icons-material/Close';

const closetItems = [
  { id: 1, name: 'White Shirt',    type: 'top',      image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=150&h=200&fit=crop' },
  { id: 2, name: 'Navy Blazer',   type: 'outerwear', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=200&fit=crop' },
  { id: 3, name: 'Black Jeans',   type: 'bottom',    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=150&h=200&fit=crop' },
  { id: 4, name: 'Cream Sweater', type: 'top',       image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=150&h=200&fit=crop' },
  { id: 5, name: 'Brown Jacket',  type: 'outerwear', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=150&h=200&fit=crop' },
  { id: 6, name: 'Floral Dress',  type: 'dress',     image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=150&h=200&fit=crop' },
  { id: 7, name: 'Beige Chinos',  type: 'bottom',    image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=150&h=200&fit=crop' },
  { id: 8, name: 'Striped Tee',   type: 'top',       image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=150&h=200&fit=crop' },
];

const categories = ['all', 'top', 'bottom', 'outerwear', 'dress'];

export default function FittingRoomScreen() {
  const [selectedItems, setSelectedItems]             = useState<number[]>([]);
  const [isGenerating, setIsGenerating]               = useState(false);
  const [generatedLook, setGeneratedLook]             = useState(false);
  const [activeCategory, setActiveCategory]           = useState('all');
  const [showInspireDialog, setShowInspireDialog]     = useState(false);
  const [inspirationImage, setInspirationImage]       = useState<string | null>(null);
  const [isAnalyzingInspiration, setIsAnalyzingInspiration] = useState(false);
  const [suggestedItems, setSuggestedItems]           = useState<number[]>([]);

  const filteredItems = activeCategory === 'all'
    ? closetItems
    : closetItems.filter((item) => item.type === activeCategory);

  const toggleItem = (id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleGenerate = () => {
    if (selectedItems.length === 0) return;
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedLook(true);
    }, 2500);
  };

  const handleReset = () => {
    setSelectedItems([]);
    setGeneratedLook(false);
    setSuggestedItems([]);
  };

  const handleUploadInspiration = () => {
    setInspirationImage('https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=500&fit=crop');
    setIsAnalyzingInspiration(true);
    setTimeout(() => {
      setIsAnalyzingInspiration(false);
      setSuggestedItems([1, 3, 5]);
      setSelectedItems([1, 3, 5]);
      setShowInspireDialog(false);
    }, 2000);
  };

  const handleCloseInspireDialog = () => {
    setShowInspireDialog(false);
    setInspirationImage(null);
    setIsAnalyzingInspiration(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* ── Header ── */}
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          bgcolor: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          px: 4,
          py: 3,
        }}
      >
        <Box sx={{ maxWidth: 1280, mx: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" sx={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 600 }}>
              Fitting Room
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              Create your perfect look
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<ImageIcon />}
            onClick={() => setShowInspireDialog(true)}
            sx={{
              bgcolor: 'primary.main',
              color: '#fff',
              opacity: 0.12,
              '&:hover': { opacity: 1 },
              // soft variant: primary tinted bg
              background: 'rgba(200,100,50,0.12)',
              color: 'primary.main',
              boxShadow: 'none',
              '&:hover': { background: 'rgba(200,100,50,0.2)', boxShadow: 'none' },
            }}
          >
            Get Inspired
          </Button>
        </Box>
      </Box>

      {/* ── Main ── */}
      <Box component="main" sx={{ flex: 1, px: 4, py: 4 }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 4 }}>

            {/* ── Preview Area ── */}
            <Box
              sx={{
                position: 'relative',
                aspectRatio: '3/4',
                maxHeight: 600,
                borderRadius: 4,
                overflow: 'hidden',
                background: 'linear-gradient(180deg, #f5f0ea 0%, #ede5d8 100%)',
                boxShadow: '0 4px 20px -4px rgba(0,0,0,0.08)',
              }}
            >
              {!generatedLook ? (
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  {isGenerating ? (
                    <Box sx={{ textAlign: 'center' }}>
                      <Box
                        sx={{
                          width: 96, height: 96, borderRadius: '50%',
                          bgcolor: 'rgba(200,100,50,0.15)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          mx: 'auto', mb: 3,
                        }}
                      >
                        <AutoFixHighIcon
                          sx={{
                            fontSize: 44, color: 'primary.main',
                            animation: 'spin 3s linear infinite',
                            '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
                          }}
                        />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 500 }}>Creating your look...</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>AI is working its magic</Typography>
                    </Box>
                  ) : (
                    <>
                      <Box
                        sx={{
                          width: 160, height: 160, borderRadius: '50%',
                          background: 'linear-gradient(135deg, rgba(200,100,50,0.25) 0%, rgba(232,149,109,0.25) 100%)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3,
                        }}
                      >
                        <AutoAwesomeIcon sx={{ fontSize: 64, color: 'rgba(200,100,50,0.55)' }} />
                      </Box>
                      <Typography
                        variant="body1" color="text.secondary"
                        sx={{ textAlign: 'center', px: 6, fontSize: 17, lineHeight: 1.6 }}
                      >
                        Select items from your closet and click{' '}
                        <Box component="span" sx={{ color: 'primary.main', fontWeight: 500 }}>Generate Look</Box>
                        {' '}to see yourself wearing them
                      </Typography>
                      {suggestedItems.length > 0 && (
                        <Box
                          sx={{
                            mt: 3, px: 3, py: 1.25,
                            bgcolor: 'rgba(200,100,50,0.1)',
                            borderRadius: 10,
                            fontSize: 13, color: 'primary.main', fontWeight: 500,
                          }}
                        >
                          ✨ {suggestedItems.length} items suggested from your inspiration
                        </Box>
                      )}
                    </>
                  )}
                </Box>
              ) : (
                <>
                  <Box
                    component="img"
                    src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=800&fit=crop"
                    alt="Generated look"
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />

                  {/* AI badge */}
                  <Box sx={{ position: 'absolute', top: 24, left: 24, right: 24 }}>
                    <Paper
                      sx={{
                        borderRadius: 3, p: 2,
                        bgcolor: 'rgba(255,255,255,0.9)',
                        backdropFilter: 'blur(20px)',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main', mb: 0.5 }}>
                        <AutoAwesomeIcon sx={{ fontSize: 18 }} />
                        <Typography sx={{ fontWeight: 500, fontSize: 14 }}>AI Generated</Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Based on {selectedItems.length} items from your closet
                      </Typography>
                    </Paper>
                  </Box>

                  {/* Action buttons */}
                  <Box sx={{ position: 'absolute', bottom: 24, left: 24, right: 24, display: 'flex', gap: 1.5 }}>
                    <Button
                      variant="contained"
                      startIcon={<FavoriteIcon />}
                      sx={{
                        flex: 1,
                        bgcolor: 'rgba(255,255,255,0.85)',
                        color: 'text.primary',
                        backdropFilter: 'blur(12px)',
                        boxShadow: 'none',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.95)', boxShadow: 'none' },
                      }}
                    >
                      Save Look
                    </Button>
                    <IconButton
                      sx={{ bgcolor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' } }}
                    >
                      <ShareIcon />
                    </IconButton>
                    <IconButton
                      onClick={handleReset}
                      sx={{ bgcolor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' } }}
                    >
                      <RestartAltIcon />
                    </IconButton>
                  </Box>
                </>
              )}
            </Box>

            {/* ── Right Panel ── */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

              {/* Category Filters */}
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                {categories.map((cat) => (
                  <Chip
                    key={cat}
                    label={cat.charAt(0).toUpperCase() + cat.slice(1)}
                    onClick={() => setActiveCategory(cat)}
                    sx={{
                      fontWeight: 500,
                      px: 1,
                      borderRadius: 2.5,
                      ...(activeCategory === cat
                        ? { bgcolor: 'text.primary', color: 'background.paper', '&:hover': { bgcolor: 'text.primary' } }
                        : { bgcolor: 'action.hover', color: 'text.secondary', '&:hover': { bgcolor: 'action.selected' } }
                      ),
                    }}
                  />
                ))}
              </Box>

              {/* Items Grid */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 1.5,
                }}
              >
                {filteredItems.map((item) => {
                  const isSelected  = selectedItems.includes(item.id);
                  const isSuggested = suggestedItems.includes(item.id);

                  return (
                    <Box
                      key={item.id}
                      component="button"
                      onClick={() => toggleItem(item.id)}
                      sx={{
                        position: 'relative',
                        aspectRatio: '3/4',
                        borderRadius: 3,
                        overflow: 'hidden',
                        bgcolor: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        outline: isSelected
                          ? '3px solid'
                          : isSuggested
                          ? '2px solid'
                          : 'none',
                        outlineColor: isSelected ? 'primary.main' : 'warning.main',
                        outlineOffset: isSelected ? 2 : 1,
                        transform: isSelected ? 'scale(0.95)' : 'scale(1)',
                        transition: 'transform 0.2s ease, outline 0.2s ease',
                        '&:hover': { transform: 'scale(0.95)' },
                      }}
                    >
                      <Box
                        component="img"
                        src={item.image}
                        alt={item.name}
                        sx={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                      />

                      {/* Selection overlay with number */}
                      {isSelected && (
                        <Box
                          sx={{
                            position: 'absolute', inset: 0,
                            bgcolor: 'rgba(200,100,50,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <Box
                            sx={{
                              width: 36, height: 36, borderRadius: '50%',
                              bgcolor: 'primary.main',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                          >
                            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>
                              {selectedItems.indexOf(item.id) + 1}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {/* Suggested badge */}
                      {isSuggested && !isSelected && (
                        <Box
                          sx={{
                            position: 'absolute', top: 6, right: 6,
                            width: 22, height: 22, borderRadius: '50%',
                            bgcolor: 'warning.main',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <AutoAwesomeIcon sx={{ fontSize: 12, color: '#fff' }} />
                        </Box>
                      )}

                      {/* Item name */}
                      <Box
                        sx={{
                          position: 'absolute', bottom: 0, left: 0, right: 0,
                          px: 1, py: 0.75,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                        }}
                      >
                        <Typography sx={{ color: '#fff', fontSize: 10, fontWeight: 500, noWrap: true, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.name}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>

              {/* Selected Summary */}
              {selectedItems.length > 0 && (
                <Box sx={{ bgcolor: 'action.hover', borderRadius: 3, p: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Selected items:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedItems.map((id) => {
                      const item = closetItems.find((i) => i.id === id);
                      return item ? (
                        <Box
                          key={id}
                          sx={{
                            px: 1.5, py: 0.75,
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                            fontSize: 13, fontWeight: 500,
                          }}
                        >
                          {item.name}
                        </Box>
                      ) : null;
                    })}
                  </Box>
                </Box>
              )}

              {/* Generate Button */}
              <Button
                size="large"
                variant="contained"
                fullWidth
                startIcon={<AutoAwesomeIcon />}
                onClick={handleGenerate}
                disabled={selectedItems.length === 0 || isGenerating}
                sx={{
                  background: 'linear-gradient(135deg, #c86432 0%, #e8956d 100%)',
                  color: '#fff',
                  py: 1.75,
                  borderRadius: 3,
                  fontSize: 16,
                  fontWeight: 500,
                  boxShadow: '0 4px 20px rgba(200,100,50,0.35)',
                  '&:hover': { filter: 'brightness(1.08)', boxShadow: '0 6px 24px rgba(200,100,50,0.45)' },
                  '&.Mui-disabled': { background: 'action.disabledBackground', color: 'text.disabled' },
                }}
              >
                {isGenerating
                  ? 'Generating...'
                  : `Generate Look${selectedItems.length > 0 ? ` (${selectedItems.length} items)` : ''}`}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── Get Inspired Dialog ── */}
      <Dialog
        open={showInspireDialog}
        onClose={handleCloseInspireDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 22, fontWeight: 600, pr: 6 }}>
          Get Inspired
          <IconButton
            onClick={handleCloseInspireDialog}
            size="small"
            sx={{ position: 'absolute', right: 16, top: 16, color: 'text.secondary' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pb: 3 }}>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Upload a style inspiration photo from Pinterest, Instagram, or any fashion source.
            We'll scan your closet and suggest the most similar items you already own to recreate that look.
          </Typography>

          {!inspirationImage ? (
            <Box
              component="button"
              onClick={handleUploadInspiration}
              sx={{
                width: '100%',
                aspectRatio: '16/9',
                borderRadius: 3,
                border: '2px dashed',
                borderColor: 'divider',
                bgcolor: 'action.hover',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(200,100,50,0.04)' },
              }}
            >
              <Box
                sx={{
                  width: 64, height: 64, borderRadius: '50%',
                  bgcolor: 'rgba(200,100,50,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <UploadIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography fontWeight={500}>Upload inspiration image</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Click to browse your gallery
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ position: 'relative', aspectRatio: '16/9', borderRadius: 3, overflow: 'hidden' }}>
              <Box
                component="img"
                src={inspirationImage}
                alt="Inspiration"
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {isAnalyzingInspiration && (
                <Box
                  sx={{
                    position: 'absolute', inset: 0,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 2,
                  }}
                >
                  <CircularProgress sx={{ color: '#fff' }} size={56} />
                  <Box sx={{ textAlign: 'center', color: '#fff' }}>
                    <Typography fontWeight={500} fontSize={17}>Analyzing your inspiration...</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
                      Finding matching items in your closet
                    </Typography>
                  </Box>
                </Box>
              )}
              <IconButton
                onClick={() => setInspirationImage(null)}
                size="small"
                sx={{
                  position: 'absolute', top: 12, right: 12,
                  bgcolor: 'rgba(255,255,255,0.85)',
                  backdropFilter: 'blur(8px)',
                  '&:hover': { bgcolor: '#fff' },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 1.5, mt: 3 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={handleCloseInspireDialog}
              sx={{ borderRadius: 2.5, py: 1.25 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              fullWidth
              startIcon={<AutoAwesomeIcon />}
              onClick={handleUploadInspiration}
              disabled={isAnalyzingInspiration}
              sx={{
                borderRadius: 2.5,
                py: 1.25,
                background: 'linear-gradient(135deg, #c86432 0%, #e8956d 100%)',
                boxShadow: 'none',
                '&:hover': { filter: 'brightness(1.08)', boxShadow: 'none' },
              }}
            >
              Find Matches
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
