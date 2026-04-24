import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Paper,
  Grid,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import PaletteIcon from '@mui/icons-material/Palette';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import type { User } from '../../entities/user';

const BODY_TYPES = ['Ectomorph', 'Mesomorph', 'Endomorph', 'Athletic', 'Average'];

const STATS = [
  { label: 'Total Items', value: '47', Icon: CheckroomIcon },
  { label: 'Outfits Created', value: '23', Icon: PaletteIcon },
];

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

function calculateAge(birthdate: string): number {
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

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

  const genderLabel = user.genderId === 1 ? 'Male' : user.genderId === 2 ? 'Female' : 'Other';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          px: 4,
          py: 2.5,
        }}
      >
        <Box sx={{ maxWidth: 900, mx: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h4" sx={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 600 }}>
            Profile
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton size="small"><NotificationsOutlinedIcon /></IconButton>
            <IconButton size="small"><SettingsOutlinedIcon /></IconButton>
          </Box>
        </Box>
      </Box>

      {/* Main */}
      <Box component="main" sx={{ flex: 1, px: 4, py: 4 }}>
        <Box sx={{ maxWidth: 900, mx: 'auto' }}>
          <Grid container spacing={3}>
            {/* Left column */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Profile card */}
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

                {/* Personal info */}
                <Paper elevation={0} sx={{ borderRadius: 3, p: 3, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="h6" sx={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 600, mb: 2 }}>
                    Personal Info
                  </Typography>
                  <Grid container spacing={1.5}>
                    {[
                      { label: 'Age', value: user.birthdate ? `${calculateAge(user.birthdate)} years` : '—' },
                      { label: 'Gender', value: genderLabel },
                      { label: 'Body Type', value: user.bodyType ?? '—' },
                      { label: 'Height', value: user.heightCm ? `${user.heightCm} cm` : '—' },
                    ].map(({ label, value }) => (
                      <Grid key={label} size={{ xs: 6 }}>
                        <Box sx={{ bgcolor: 'grey.50', borderRadius: 2, p: 2 }}>
                          <Typography variant="caption" color="text.secondary">{label}</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.25 }}>{value}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>

                {/* Stats */}
                <Grid container spacing={1.5}>
                  {STATS.map(({ label, value, Icon }) => (
                    <Grid key={label} size={{ xs: 6 }}>
                      <Paper elevation={0} sx={{ borderRadius: 3, p: 2.5, border: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'rgba(200,100,50,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
                          <Icon sx={{ color: 'primary.main', fontSize: 20 }} />
                        </Box>
                        <Typography variant="h5" sx={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 700 }}>{value}</Typography>
                        <Typography variant="caption" color="text.secondary">{label}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>

            {/* Right column */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Style insights */}
                <Paper elevation={0} sx={{ borderRadius: 3, p: 3, border: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 600 }}>
                        Style Insights
                      </Typography>
                      <Typography variant="caption" color="text.secondary">This month's summary</Typography>
                    </Box>
                    <Button size="small" variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>View All</Button>
                  </Box>
                  {[
                    { label: 'Most worn color', value: 'Black', swatch: true },
                    { label: 'Favorite category', value: 'Tops' },
                    { label: 'Items added this month', value: '5' },
                  ].map(({ label, value, swatch }, i, arr) => (
                    <Box
                      key={label}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        py: 1.5,
                        borderBottom: i < arr.length - 1 ? '1px solid' : 'none',
                        borderColor: 'divider',
                      }}
                    >
                      <Typography variant="body2">{label}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {swatch && <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#1a1a1a' }} />}
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{value}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Paper>

                {/* Edit profile button */}
                <Box
                  component="button"
                  onClick={openEdit}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2.5,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    cursor: 'pointer',
                    transition: 'background-color 0.15s',
                    '&:hover': { bgcolor: 'grey.50' },
                  }}
                >
                  <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PersonIcon sx={{ color: 'text.secondary' }} />
                  </Box>
                  <Box sx={{ flex: 1, textAlign: 'left' }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>Edit Profile</Typography>
                    <Typography variant="caption" color="text.secondary">Update your details and preferences</Typography>
                  </Box>
                  <ChevronRightIcon sx={{ color: 'text.secondary' }} />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={() => setEditOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Edit Profile
          <IconButton size="small" onClick={() => setEditOpen(false)}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {/* Avatar */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #c86432, #e8956d)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography sx={{ color: '#fff', fontSize: 32, fontFamily: '"Cormorant Garamond", serif', fontWeight: 600 }}>
                  {draft.username.charAt(0)}
                </Typography>
              </Box>
              <Button variant="outlined" size="small" sx={{ borderRadius: 2, textTransform: 'none' }}>Change Avatar</Button>
            </Box>

            <TextField
              label="Name"
              value={draft.username}
              onChange={e => setDraft({ ...draft, username: e.target.value })}
              size="small"
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={draft.email}
              onChange={e => setDraft({ ...draft, email: e.target.value })}
              size="small"
              fullWidth
            />
            <TextField
              label="Date of Birth"
              type="date"
              value={draft.birthdate ?? ''}
              onChange={e => setDraft({ ...draft, birthdate: e.target.value })}
              size="small"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <FormControl size="small" fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select
                label="Gender"
                value={draft.genderId ?? ''}
                onChange={e => setDraft({ ...draft, genderId: Number(e.target.value) })}
              >
                <MenuItem value={1}>Male</MenuItem>
                <MenuItem value={2}>Female</MenuItem>
                <MenuItem value={3}>Other</MenuItem>
                <MenuItem value={4}>Prefer not to say</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Body Type</InputLabel>
              <Select
                label="Body Type"
                value={draft.bodyType ?? ''}
                onChange={e => setDraft({ ...draft, bodyType: e.target.value })}
              >
                {BODY_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField
              label="Height (cm)"
              type="number"
              value={draft.heightCm ?? ''}
              onChange={e => setDraft({ ...draft, heightCm: Number(e.target.value) || null })}
              size="small"
              fullWidth
            />

            <Box sx={{ display: 'flex', gap: 1.5, pt: 1 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setEditOpen(false)}
                startIcon={<CloseIcon />}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSave}
                startIcon={<CheckIcon />}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Save Changes
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
