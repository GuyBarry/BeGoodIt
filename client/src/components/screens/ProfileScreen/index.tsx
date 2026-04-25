import { useState } from 'react';
import { Box, CircularProgress, Grid, Typography } from '@mui/material';
import type { User } from '../../../entities/user';
import { useUser, useUpdateUser } from '../../../api';
import ProfileHeader from './ProfileHeader';
import ProfileCard from './ProfileCard';
import PersonalInfoCard from './PersonalInfoCard';
import StatsGrid from './StatsGrid';
import StyleInsightsCard from './StyleInsightsCard';
import EditProfileButton from './EditProfileButton';
import EditProfileDialog from './EditProfileDialog';

// TODO: replace with real auth session user id
const CURRENT_USER_ID = '00000000-0000-0000-0000-000000000001';

export default function ProfileScreen() {
  const { data: user, isLoading, isError } = useUser(CURRENT_USER_ID);
  const { mutate: updateUser } = useUpdateUser(CURRENT_USER_ID);

  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState<User | null>(null);

  const openEdit = () => {
    if (user) {
      setDraft(user);
      setEditOpen(true);
    }
  };

  const handleSave = () => {
    if (!draft) return;
    updateUser({
      username: draft.username,
      birthdate: draft.birthdate,
      heightCm: draft.heightCm,
      bodyType: draft.bodyType,
      genderId: draft.gender?.id ?? undefined,
    });
    setEditOpen(false);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !user) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <Typography color="error">Failed to load profile.</Typography>
      </Box>
    );
  }

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

      {draft && (
        <EditProfileDialog
          open={editOpen}
          draft={draft}
          onDraftChange={setDraft}
          onSave={handleSave}
          onClose={() => setEditOpen(false)}
        />
      )}
    </Box>
  );
}
