import { useRef, useState, useCallback } from 'react';
import { Box, CircularProgress, IconButton, Typography } from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import CloseIcon from '@mui/icons-material/Close';
import { PRIMARY_ALPHA } from '../../styles/tokens';

interface Props {
  imageUrl: string | null;
  isProcessing?: boolean;
  processingLabel?: string;
  processingSubLabel?: string;
  accept?: string;
  aspectRatio?: string;
  onFileSelect: (file: File) => void;
  onClear: () => void;
}

export default function ImageUploadArea({
  imageUrl,
  isProcessing = false,
  processingLabel = 'Analyzing...',
  processingSubLabel,
  accept = 'image/*',
  aspectRatio = '16/9',
  onFileSelect,
  onClear,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (files && files[0]) onFileSelect(files[0]);
    },
    [onFileSelect],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  if (imageUrl) {
    return (
      <Box sx={{ position: 'relative', aspectRatio, borderRadius: 3, overflow: 'hidden' }}>
        <Box component="img" src={imageUrl} alt="Upload preview" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />

        {isProcessing && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              bgcolor: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            <CircularProgress sx={{ color: '#fff' }} size={56} />
            <Box sx={{ textAlign: 'center', color: '#fff' }}>
              <Typography fontWeight={500} fontSize={17}>{processingLabel}</Typography>
              {processingSubLabel && (
                <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>{processingSubLabel}</Typography>
              )}
            </Box>
          </Box>
        )}

        {!isProcessing && (
          <IconButton
            onClick={onClear}
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              bgcolor: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(8px)',
              '&:hover': { bgcolor: '#fff' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    );
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={e => handleFiles(e.target.files)}
      />
      <Box
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          width: '100%',
          aspectRatio,
          borderRadius: 3,
          border: '2px dashed',
          borderColor: isDragging ? 'primary.main' : 'divider',
          bgcolor: isDragging ? PRIMARY_ALPHA[10] : 'action.hover',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': { borderColor: 'primary.main', bgcolor: PRIMARY_ALPHA[4] },
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: PRIMARY_ALPHA[10],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <UploadIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography fontWeight={500}>
            {isDragging ? 'Drop image here' : 'Upload image'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Drag & drop or click to browse
          </Typography>
        </Box>
      </Box>
    </>
  );
}
