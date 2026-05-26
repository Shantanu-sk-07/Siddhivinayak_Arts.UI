import { Box, Typography, Paper } from '@mui/material';

export default function Profile() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Profile</Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Profile page content goes here</Typography>
      </Paper>
    </Box>
  );
}