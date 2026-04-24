import { Box, Typography, Paper, Grid } from '@mui/material';
import type { User } from '../../../entities/user';

interface Props {
  user: User;
}

function calculateAge(birthdate: string): number {
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

const GENDER_LABELS: Record<number, string> = { 1: 'Male', 2: 'Female', 3: 'Other', 4: 'Prefer not to say' };

export default function PersonalInfoCard({ user }: Props) {
  const fields = [
    { label: 'Age', value: user.birthdate ? `${calculateAge(user.birthdate)} years` : '—' },
    { label: 'Gender', value: user.genderId ? (GENDER_LABELS[user.genderId] ?? '—') : '—' },
    { label: 'Body Type', value: user.bodyType ?? '—' },
    { label: 'Height', value: user.heightCm ? `${user.heightCm} cm` : '—' },
  ];

  return (
    <Paper elevation={0} sx={{ borderRadius: 3, p: 3, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Personal Info
      </Typography>
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
    </Paper>
  );
}
