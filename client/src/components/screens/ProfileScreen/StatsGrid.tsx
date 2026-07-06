import { Box, Typography } from '@mui/material';
import { PRIMARY_ALPHA } from '../../../styles/tokens';
import type { SvgIconComponent } from '@mui/icons-material';

export interface StatItem {
  title: string | number;
  subtitle: string;
  Icon: SvgIconComponent;
  onClick: () => void;
}

interface Props {
  items: StatItem[];
}

export default function StatsGrid({ items }: Props) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: 1.5,
        height: '100%',
      }}
    >
      {items.map(({ title, subtitle, Icon, onClick }) => (
        <Box
          key={subtitle}
          component="button"
          onClick={onClick}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            textAlign: 'left',
            borderRadius: 3,
            p: 2.5,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'background-color 0.15s, border-color 0.15s',
            '&:hover': {
              bgcolor: PRIMARY_ALPHA[4],
              borderColor: 'primary.light',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 1 }}>
            <Typography sx={{ fontWeight: 600, fontSize: 20 }}>{title}</Typography>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1.5,
                bgcolor: PRIMARY_ALPHA[10],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon sx={{ color: 'primary.main', fontSize: 16 }} />
            </Box>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, fontSize: 14 }}>
            {subtitle}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
