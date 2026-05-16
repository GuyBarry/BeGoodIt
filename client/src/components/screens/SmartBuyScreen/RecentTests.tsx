import { Box, Typography } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { GRADIENTS, SERIF_FONT } from '../../../styles/tokens';
import type { RecentTest } from './types';

interface Props {
  tests: RecentTest[];
  onRetest: (test: RecentTest) => void;
}

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function RecentTests({ tests, onRetest }: Props) {
  if (tests.length === 0) return null;

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: '24px',
        p: 3,
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Box
          sx={{
            width: 40, height: 40, borderRadius: 2, flexShrink: 0,
            bgcolor: 'action.hover',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <AccessTimeIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
        </Box>
        <Box>
          <Typography sx={{ fontFamily: SERIF_FONT, fontSize: 20, fontWeight: 600 }}>Recent Tests</Typography>
          <Typography variant="body2" color="text.secondary">Items you've tested recently</Typography>
        </Box>
      </Box>

      {/* Items grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
          gridAutoRows: '1fr',
          gap: 2,
        }}
      >
        {tests.map(test => (
          <Box
            key={test.id}
            component="button"
            onClick={() => onRetest(test)}
            sx={{
              textAlign: 'left',
              bgcolor: 'action.hover',
              borderRadius: 3,
              p: 2,
              border: 'none',
              cursor: 'pointer',
              width: '100%',
              height: '100%',
              transition: 'background-color 0.15s',
              '&:hover': { bgcolor: 'action.selected' },
            }}
          >
            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* Portrait thumbnail */}
              <Box
                sx={{
                  width: 80, height: 96, borderRadius: 2,
                  overflow: 'hidden', flexShrink: 0,
                  bgcolor: 'background.paper',
                }}
              >
                <Box
                  component="img"
                  src={test.imageUrl}
                  alt={test.name}
                  sx={{
                    width: '100%', height: '100%', objectFit: 'cover',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.05)' },
                  }}
                />
              </Box>

              {/* Details */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 500 }} noWrap>{test.name}</Typography>
                <Typography variant="body2" color="text.secondary">{formatDate(test.testedAt)}</Typography>

                {/* Gradient progress bar */}
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      flex: 1, height: 8,
                      bgcolor: 'background.default',
                      borderRadius: 4, overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        width: `${test.compatibilityPct}%`,
                        background: GRADIENTS.primary,
                        borderRadius: 4,
                      }}
                    />
                  </Box>
                  <Typography variant="body2" color="primary.main" sx={{ fontWeight: 500, flexShrink: 0 }}>
                    {test.compatibilityPct}%
                  </Typography>
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {test.matchCount} matches
                </Typography>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
