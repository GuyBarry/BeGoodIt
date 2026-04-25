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
import { GRADIENTS, SERIF_FONT } from '../../../styles/tokens';
import type { User } from '../../../entities/user';

const BODY_TYPES = ['Ectomorph', 'Mesomorph', 'Endomorph', 'Athletic', 'Average'];

interface Props {
  open: boolean;
  draft: User;
  onDraftChange: (updated: User) => void;
  onSave: () => void;
  onClose: () => void;
}

export default function EditProfileDialog({ open, draft, onDraftChange, onSave, onClose }: Props) {
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
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: GRADIENTS.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography sx={{ color: '#fff', fontSize: 32, fontFamily: SERIF_FONT, fontWeight: 600 }}>
                {draft.username.charAt(0)}
              </Typography>
            </Box>
            <Button variant="outlined" size="small" sx={{ borderRadius: 2, textTransform: 'none' }}>
              Change Avatar
            </Button>
          </Box>

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
              value={draft.genderId ?? ''}
              onChange={e => onDraftChange({ ...draft, genderId: Number(e.target.value) })}
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
