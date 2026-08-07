import { useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { PRIMARY_ALPHA, SERIF_FONT } from '../../../styles/tokens';

const DISMISSED_KEY = 'bgi:getting-started-dismissed';

interface Props {
  hasClothes: boolean;
  hasBodyImage: boolean;
  hasOutfit: boolean;
}

export default function GettingStartedChecklist({ hasClothes, hasBodyImage, hasOutfit }: Props) {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISSED_KEY) === 'true');

  if (dismissed || (hasClothes && hasBodyImage && hasOutfit)) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, 'true');
    setDismissed(true);
  };

  const steps = [
    { label: 'Add your first item', done: hasClothes, onClick: () => navigate('/add') },
    { label: 'Add a body photo', done: hasBodyImage, onClick: () => navigate('/body') },
    { label: 'Build your first outfit', done: hasOutfit, onClick: undefined },
  ];

  return (
    <Box
      sx={{
        mx: 4,
        mt: 3,
        p: 2.5,
        borderRadius: 3,
        bgcolor: PRIMARY_ALPHA[4],
        border: `1px solid ${PRIMARY_ALPHA[15]}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontFamily: SERIF_FONT, fontSize: 18, fontWeight: 600 }}>
          Getting Started
        </Typography>
        <IconButton size="small" onClick={dismiss} aria-label="Dismiss getting started checklist">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {steps.map(step => (
          <Box
            key={step.label}
            component={step.onClick && !step.done ? 'button' : 'div'}
            onClick={step.onClick && !step.done ? step.onClick : undefined}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              border: 'none',
              background: 'none',
              p: 0,
              fontFamily: 'inherit',
              cursor: step.onClick && !step.done ? 'pointer' : 'default',
              color: step.done ? 'text.secondary' : 'text.primary',
              textDecoration: step.done ? 'line-through' : 'none',
              '&:hover': step.onClick && !step.done ? { color: 'primary.main' } : undefined,
            }}
          >
            {step.done
              ? <CheckCircleIcon fontSize="small" sx={{ color: 'success.main' }} />
              : <RadioButtonUncheckedIcon fontSize="small" sx={{ color: 'text.disabled' }} />}
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {step.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
