import { Box, Typography, Paper } from '@mui/material';

export default function Settings() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Settings</Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Settings page content goes here</Typography>
      </Paper>
    </Box>
  );
}