import { useState } from 'react';
import { Box, Grid } from '@mui/material';
import type { User } from '../../../entities/user';
import ProfileHeader from './ProfileHeader';
import ProfileCard from './ProfileCard';
import PersonalInfoCard from './PersonalInfoCard';
import StatsGrid from './StatsGrid';
import StyleInsightsCard from './StyleInsightsCard';
import EditProfileButton from './EditProfileButton';
import EditProfileDialog from './EditProfileDialog';

const INITIAL_USER: User = {
  id: '1',
  username: 'Sarah Johnson',
  email: 'sarah@example.com',
  profilePictureUrl: null,
  genderId: 2,
  birthdate: '1995-06-15',
  heightCm: 165,
  bodyType: 'Athletic',
  createdAt: '2024-01-01T00:00:00.000Z',
};

export default function ProfileScreen() {
  const [user, setUser] = useState<User>(INITIAL_USER);
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState<User>(user);

  const openEdit = () => {
    setDraft(user);
    setEditOpen(true);
  };

  const handleSave = () => {
    setUser(draft);
    setEditOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <ProfileHeader />

      <Box component="main" sx={{ flex: 1, px: 4, py: 4 }}>
        <Box sx={{ maxWidth: 900, mx: 'auto' }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <ProfileCard user={user} />
                <PersonalInfoCard user={user} />
                <StatsGrid />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <StyleInsightsCard />
                <EditProfileButton onClick={openEdit} />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <EditProfileDialog
        open={editOpen}
        draft={draft}
        onDraftChange={setDraft}
        onSave={handleSave}
        onClose={() => setEditOpen(false)}
      />
    </Box>
  );
}
