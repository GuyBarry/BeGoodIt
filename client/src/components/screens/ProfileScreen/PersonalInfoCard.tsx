import { Box, Typography, Grid } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import type { User } from '../../../entities/user';
import { PRIMARY_ALPHA } from '../../../styles/tokens';

interface Props {
  user: User;
  onEdit: () => void;
}

function calculateAge(birthdate: string): number {
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function PersonalInfoCard({ user, onEdit }: Props) {
  const fields = [
    { label: 'Age', value: user.birthdate ? `${calculateAge(user.birthdate)} years` : '—' },
    { label: 'Gender', value: user.gender?.name ?? '—' },
    { label: 'Body Type', value: user.bodyType ?? '—' },
    { label: 'Height', value: user.heightCm ? `${user.heightCm} cm` : '—' },
  ];

  return (
    <Box
      component="button"
      onClick={onEdit}
      sx={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        borderRadius: 3,
        p: 3,
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
        '&:hover .personal-info-edit-icon': { opacity: 1 },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Personal Info</Typography>
        <EditOutlinedIcon
          className="personal-info-edit-icon"
          sx={{ color: 'primary.main', fontSize: 20, opacity: 0, transition: 'opacity 0.15s' }}
        />
      </Box>
      <Grid container spacing={1.5}>
        {fields.map(({ label, value }) => (
          <Grid key={label} size={{ xs: 6 }}>
            <Box sx={{ bgcolor: 'grey.50', borderRadius: 2, p: 2 }}>
              <Typography variant="caption" color="text.secondary">{label}</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.25 }}>{value}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
