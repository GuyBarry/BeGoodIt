import { useEffect, useState } from 'react';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { Box, Fade, Typography } from '@mui/material';
import { PRIMARY_ALPHA } from '../../../styles/tokens';

const TIPS = [
  "Items that match 3+ pieces in your closet are proven to get worn more often.",
  "Neutral colors like black, white, and beige pair with almost everything you own.",
  "A 70%+ compatibility score usually means a piece will become a wardrobe staple.",
  "The average closet only gets a fraction of its items worn regularly — smart buys close that gap.",
  "Look for pieces that unlock 3 or more new outfits to get the most value per wear.",
  "Layering pieces like jackets and cardigans tend to match with far more of your closet.",
  "Comparing before you buy is one of the easiest ways to cut down on impulse purchases.",
];

const ROTATE_MS = 3200;

/** Picks a random tip index, never immediately repeating the given one. */
function randomIndex(exclude?: number) {
  if (TIPS.length <= 1) return 0;
  let next = Math.floor(Math.random() * TIPS.length);
  while (next === exclude) next = Math.floor(Math.random() * TIPS.length);
  return next;
}

/** Rotating "did you know" tips shown while Smart Buy analyzes an item. */
export default function AnalyzingTips() {
  const [index, setIndex] = useState(() => randomIndex());
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex(prev => randomIndex(prev));
        setVisible(true);
      }, 200);
    }, ROTATE_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        border: '1px solid', borderColor: 'divider',
        borderRadius: 3, p: 3,
        display: 'flex', alignItems: 'flex-start', gap: 2,
        bgcolor: PRIMARY_ALPHA[4],
        minHeight: 104,
      }}
    >
      <Box
        sx={{
          width: 40, height: 40, borderRadius: 2, flexShrink: 0,
          bgcolor: PRIMARY_ALPHA[15],
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <LightbulbIcon sx={{ color: 'primary.main', fontSize: 20 }} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5, color: 'primary.main', mb: 0.75 }}>
          Did you know?
        </Typography>
        <Fade in={visible} timeout={200}>
          <Typography sx={{ fontSize: 15, lineHeight: 1.6, color: 'text.secondary', minHeight: 48 }}>
            {TIPS[index]}
          </Typography>
        </Fade>
        <Box sx={{ display: 'flex', gap: 0.5, mt: 1.5 }}>
          {TIPS.map((_, i) => (
            <Box
              key={i}
              sx={{
                width: i === index ? 14 : 5, height: 5, borderRadius: 3,
                bgcolor: i === index ? 'primary.main' : PRIMARY_ALPHA[20],
                transition: 'all 0.25s ease',
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
