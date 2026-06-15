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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import { GRADIENTS, PRIMARY_ALPHA, SERIF_FONT } from '../../../styles/tokens';
import type { User } from '../../../entities/user';
import { useGenders } from '../../../api';
import { AVATAR_PALETTE, colorChoiceValue, parseColorChoice } from './avatarColor';

const BODY_TYPES = ['Ectomorph', 'Mesomorph', 'Endomorph', 'Athletic', 'Average'];

interface Props {
  open: boolean;
  draft: User;
  onDraftChange: (updated: User) => void;
  onSave: () => void;
  onClose: () => void;
}

export default function EditProfileDialog({ open, draft, onDraftChange, onSave, onClose }: Props) {
  const { data: genders = [] } = useGenders();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle
        sx={{
          fontFamily: SERIF_FONT,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        Edit Profile
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          {(() => {
            const chosenColor = parseColorChoice(draft.profilePictureUrl);
            return (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.75 }}>
                <Box
                  sx={{
                    width: 88,
                    height: 88,
                    borderRadius: '50%',
                    background: chosenColor ?? GRADIENTS.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s ease',
                  }}
                >
                  <Typography sx={{ color: '#fff', fontSize: 36, fontFamily: SERIF_FONT, fontWeight: 600 }}>
                    {(draft.username || '?').charAt(0).toUpperCase()}
                  </Typography>
                </Box>

                <Typography variant="caption" color="text.secondary">
                  Pick an avatar color
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {AVATAR_PALETTE.map((hex) => {
                    const isSelected = chosenColor === hex;
                    return (
                      <Box
                        key={hex}
                        component="button"
                        type="button"
                        aria-label={`Avatar color ${hex}`}
                        aria-pressed={isSelected}
                        onClick={() => onDraftChange({ ...draft, profilePictureUrl: colorChoiceValue(hex) })}
                        sx={{
                          width: 28,
                          height: 28,
                          p: 0,
                          borderRadius: '50%',
                          bgcolor: hex,
                          border: '2px solid',
                          borderColor: isSelected ? 'background.paper' : 'transparent',
                          outline: isSelected ? `2px solid ${hex}` : 'none',
                          cursor: 'pointer',
                          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                          boxShadow: isSelected ? `0 4px 10px ${PRIMARY_ALPHA[35]}` : 'none',
                          '&:hover': { transform: 'scale(1.12)' },
                          '&:focus-visible': {
                            outline: '2px solid',
                            outlineColor: 'primary.main',
                            outlineOffset: 2,
                          },
                        }}
                      />
                    );
                  })}
                </Box>
                {chosenColor && (
                  <Button
                    size="small"
                    onClick={() => onDraftChange({ ...draft, profilePictureUrl: null })}
                    sx={{ textTransform: 'none', mt: -0.5 }}
                  >
                    Reset to default
                  </Button>
                )}
              </Box>
            );
          })()}

          <TextField
            label="Name"
            value={draft.username}
            onChange={e => onDraftChange({ ...draft, username: e.target.value })}
            size="small"
            fullWidth
          />
          <TextField
            label="Email"
            type="email"
            value={draft.email}
            onChange={e => onDraftChange({ ...draft, email: e.target.value })}
            size="small"
            fullWidth
          />
          <TextField
            label="Date of Birth"
            type="date"
            value={draft.birthdate ?? ''}
            onChange={e => onDraftChange({ ...draft, birthdate: e.target.value })}
            size="small"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <FormControl size="small" fullWidth>
            <InputLabel>Gender</InputLabel>
            <Select
              label="Gender"
              value={draft.gender?.id ?? ''}
              onChange={e => {
                const selected = genders.find(g => g.id === Number(e.target.value)) ?? null;
                onDraftChange({ ...draft, gender: selected });
              }}
            >
              {genders.map(g => <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel>Body Type</InputLabel>
            <Select
              label="Body Type"
              value={draft.bodyType ?? ''}
              onChange={e => onDraftChange({ ...draft, bodyType: e.target.value })}
            >
              {BODY_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField
            label="Height (cm)"
            type="number"
            value={draft.heightCm ?? ''}
            onChange={e => onDraftChange({ ...draft, heightCm: Number(e.target.value) || null })}
            size="small"
            fullWidth
          />

          <Box sx={{ display: 'flex', gap: 1.5, pt: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={onClose}
              startIcon={<CloseIcon />}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={onSave}
              startIcon={<CheckIcon />}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Save Changes
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
