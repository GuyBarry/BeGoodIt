import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, CircularProgress, Grid, Paper, Typography } from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineOutlined';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import PaletteIcon from '@mui/icons-material/Palette';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import type { User } from '../../../entities/user';
import { useUser, useUpdateUser, useClothingItems, useBodyImage, useGetOutfits } from '../../../api';
import { imagesApi } from '../../../api/api/images.api';
import { useCurrentUser, useLogout } from '../../../auth/AuthContext';
import { useScrollShadow } from '../../../hooks/useScrollShadow';
import { GRADIENTS, PRIMARY_ALPHA } from '../../../styles/tokens';
import ProfileHeader from './ProfileHeader';
import ProfileCard from './ProfileCard';
import PersonalInfoCard from './PersonalInfoCard';
import StatsGrid from './StatsGrid';
import EditProfileDialog from './EditProfileDialog';

export default function ProfileScreen() {
  const currentUserId = useCurrentUser().id;
  const logout = useLogout();
  const { data: user, isLoading, isError } = useUser(currentUserId);
  const { mutate: updateUser } = useUpdateUser(currentUserId);
  const { data: clothingItems = [] } = useClothingItems(currentUserId);
  const { data: bodyImage } = useBodyImage(currentUserId);
  const { data: outfits = [] } = useGetOutfits(currentUserId);

  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState<User | null>(null);
  const { ref: mainRef, onScroll: onMainScroll, sx: scrollShadowSx } =
    useScrollShadow([user, clothingItems.length, outfits.length]);

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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !user || !user.username) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Typography color="error">Failed to load profile.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', bgcolor: 'background.default' }}>
      <ProfileHeader />

      <Box
        component="main"
        ref={mainRef}
        onScroll={onMainScroll}
        sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 4, py: 4, ...scrollShadowSx }}
      >
        <Box sx={{ maxWidth: 900, mx: 'auto' }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
                <ProfileCard user={user} />
                <PersonalInfoCard user={user} onEdit={openEdit} />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
                {/* Virtual Try-On Model card */}
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 4, overflow: 'hidden',
                    border: '1px solid', borderColor: 'divider',
                    height: 220,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box sx={{ background: GRADIENTS.primarySubtle, px: 3, pt: 3, pb: 2.5, flex: 1 }}>
                    <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
                      {bodyImage?.imageId ? (
                        <Box
                          onClick={() => navigate('/body')}
                          sx={{
                            width: 72, height: 96, borderRadius: 2.5, flexShrink: 0,
                            overflow: 'hidden', cursor: 'pointer',
                            bgcolor: 'grey.100',
                            border: '2px solid', borderColor: 'background.paper',
                            boxShadow: `0 4px 12px ${PRIMARY_ALPHA[25]}`,
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                            '&:hover': {
                              transform: 'scale(1.03)',
                              boxShadow: `0 6px 16px ${PRIMARY_ALPHA[35]}`,
                            },
                          }}
                        >
                          <Box
                            component="img"
                            src={imagesApi.getImageUrl(bodyImage.imageId)}
                            alt="Your virtual try-on model"
                            sx={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                          />
                        </Box>
                      ) : (
                        <Box sx={{
                          width: 52, height: 52, borderRadius: 3, flexShrink: 0,
                          background: GRADIENTS.primary,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <PersonOutlineIcon sx={{ color: '#fff', fontSize: 26 }} />
                        </Box>
                      )}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6">Virtual Try-On Model</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.6 }}>
                          {bodyImage?.imageId
                            ? 'Your photo is ready — the Fitting Room will use it for try-ons.'
                            : 'Upload a full-body photo so the Fitting Room can show how outfits look on you.'}
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
                      {bodyImage ? 'Replace photo' : 'Set up'}
                    </Button>
                  </Box>
                </Paper>

                <Box sx={{ flex: 1 }}>
                  <StatsGrid
                    items={[
                      {
                        title: clothingItems.length,
                        subtitle: 'Total Items',
                        Icon: CheckroomIcon,
                        onClick: () => navigate('/closet'),
                      },
                      {
                        title: outfits.length,
                        subtitle: 'Saved Outfits',
                        Icon: PaletteIcon,
                        onClick: () => navigate('/closet', { state: { tab: 'outfits' } }),
                      },
                      {
                        title: 'Edit Profile',
                        subtitle: 'Update your details',
                        Icon: PersonIcon,
                        onClick: openEdit,
                      },
                      {
                        title: 'Log out',
                        subtitle: 'Sign out of your account',
                        Icon: LogoutIcon,
                        onClick: logout,
                      },
                    ]}
                  />
                </Box>
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
