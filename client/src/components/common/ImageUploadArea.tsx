import { useRef, useState, useCallback } from 'react';
import { Box, CircularProgress, IconButton, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import CloseIcon from '@mui/icons-material/Close';
import { PRIMARY_ALPHA } from '../../styles/tokens';
import { emitImageTooLarge, isImageTooLarge } from '../../lib/imageUpload';

interface Props {
  imageUrl: string | null;
  isProcessing?: boolean;
  processingLabel?: string;
  processingSubLabel?: string;
  accept?: string;
  aspectRatio?: string;
  sx?: SxProps<Theme>;
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
  sx,
  onFileSelect,
  onClear,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDragRejected, setIsDragRejected] = useState(false);

  const isImageFile = (file: File) => file.type.startsWith('image/');

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || !files[0]) return;
      if (!isImageFile(files[0])) return;
      if (isImageTooLarge(files[0])) {
        emitImageTooLarge();
        return;
      }
      onFileSelect(files[0]);
    },
    [onFileSelect],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const hasNonImage = Array.from(e.dataTransfer.items).some(
      item => item.kind === 'file' && !item.type.startsWith('image/'),
    );
    setIsDragging(!hasNonImage);
    setIsDragRejected(hasNonImage);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
      setIsDragRejected(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setIsDragRejected(false);
    handleFiles(e.dataTransfer.files);
  };

  if (imageUrl) {
    return (
      <Box sx={{ position: 'relative', aspectRatio, borderRadius: 3, overflow: 'hidden', ...sx as object }}>
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
              <Typography sx={{ fontWeight: 500, fontSize: 17 }}>{processingLabel}</Typography>
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
          borderColor: isDragRejected ? 'error.main' : isDragging ? 'primary.main' : 'divider',
          bgcolor: isDragRejected ? 'error.light' : isDragging ? PRIMARY_ALPHA[10] : 'action.hover',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': { borderColor: 'primary.main', bgcolor: PRIMARY_ALPHA[4] },
          ...sx as object,
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
          <Typography sx={{ fontWeight: 500 }}>
            {isDragRejected ? 'Images only' : isDragging ? 'Drop image here' : 'Upload image'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Drag & drop or click to browse
          </Typography>
        </Box>
      </Box>
    </>
  );
}
