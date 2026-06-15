import { Box, Typography } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { GRADIENTS, SERIF_FONT } from '../../../styles/tokens';
import type { User } from '../../../entities/user';
import { parseColorChoice } from './avatarColor';

interface Props {
  user: User;
}

export default function ProfileCard({ user }: Props) {
  const chosenColor = parseColorChoice(user.profilePictureUrl);

  return (
    <Box
      sx={{
        position: 'relative',
        background: GRADIENTS.primarySubtle,
        borderRadius: 4,
        p: 4,
        overflow: 'hidden',
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: chosenColor ?? GRADIENTS.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 2,
          transition: 'background 0.2s ease',
        }}
      >
        <Typography sx={{ color: '#fff', fontSize: 32, fontFamily: SERIF_FONT, fontWeight: 600 }}>
          {(user.username || '?').charAt(0).toUpperCase()}
        </Typography>
      </Box>
      <Typography variant="h5">
        {user.username}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        Member since {new Date(user.createdAt).getFullYear()}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 1.5, color: 'primary.main' }}>
        <EmojiEventsIcon fontSize="small" />
        <Typography variant="body2" sx={{ fontWeight: 500 }}>Pro Member</Typography>
      </Box>
    </Box>
  );
}
