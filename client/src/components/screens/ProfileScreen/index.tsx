import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, CircularProgress, Grid, Paper, Typography } from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import type { User } from '../../../entities/user';
import { useUser, useUpdateUser, useClothingItems, useBodyImage } from '../../../api';
import { GRADIENTS, PRIMARY_ALPHA } from '../../../styles/tokens';
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
  const { data: clothingItems = [] } = useClothingItems(CURRENT_USER_ID);
  const { data: bodyImage } = useBodyImage(CURRENT_USER_ID);

  const navigate = useNavigate();
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

  if (isError || !user || !user.username) {
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
                <StatsGrid itemsCount={clothingItems.length} />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Virtual Try-On Model card */}
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 4, overflow: 'hidden',
                    border: '1px solid', borderColor: 'divider',
                  }}
                >
                  <Box sx={{ background: GRADIENTS.primarySubtle, px: 3, pt: 3, pb: 2.5 }}>
                    <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
                      <Box sx={{
                        width: 52, height: 52, borderRadius: 3, flexShrink: 0,
                        background: GRADIENTS.primary,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <PersonOutlineIcon sx={{ color: '#fff', fontSize: 26 }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6">Virtual Try-On Model</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.6 }}>
                          Upload a full-body photo so the Fitting Room can show how outfits look on you.
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{
                      px: 1.5, py: 0.5, borderRadius: 10,
                      bgcolor: bodyImage ? 'success.light' : PRIMARY_ALPHA[10],
                    }}>
                      <Typography variant="caption" sx={{ color: bodyImage ? 'success.dark' : 'primary.main', fontWeight: 500 }}>
                        {bodyImage ? 'Ready' : 'Not set up yet'}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => navigate('/body')}
                      sx={{ textTransform: 'none', fontWeight: 500 }}
                    >
                      Set up
                    </Button>
                  </Box>
                </Paper>

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
