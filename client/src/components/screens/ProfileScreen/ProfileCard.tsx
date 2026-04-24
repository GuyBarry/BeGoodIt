import { Box, Typography } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import type { User } from '../../../entities/user';

interface Props {
  user: User;
}

export default function ProfileCard({ user }: Props) {
  return (
    <Box
      sx={{
        position: 'relative',
        background: 'linear-gradient(135deg, rgba(200,100,50,0.12) 0%, rgba(232,149,109,0.06) 100%)',
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
          background: 'linear-gradient(135deg, #c86432, #e8956d)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 2,
        }}
      >
        <Typography sx={{ color: '#fff', fontSize: 32, fontFamily: '"Cormorant Garamond", serif', fontWeight: 600 }}>
          {user.username.charAt(0)}
        </Typography>
      </Box>
      <Typography variant="h5" sx={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 600 }}>
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
