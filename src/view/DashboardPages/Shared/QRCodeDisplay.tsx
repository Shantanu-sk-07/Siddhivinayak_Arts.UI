// src/view/DashboardPages/Shared/QRCodeDisplay.tsx
import { Box, Typography, Paper } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  bookingId: string;
  customerName: string;
  ganpatiName: string;
}

export default function QRCodeDisplay({ bookingId, customerName, ganpatiName }: QRCodeDisplayProps) {
  const qrValue = JSON.stringify({ bookingId, customerName, ganpatiName, timestamp: new Date().toISOString() });
  return (
    <Box textAlign="center" py={2}>
      <Paper sx={{ p: 3, display: 'inline-block', bgcolor: '#ffffff' }}>
        <QRCodeSVG value={qrValue} size={250} level="H" includeMargin />
      </Paper>
      <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 600 }}>Booking ID: {bookingId}</Typography>
      <Typography variant="body2" color="textSecondary">Customer: {customerName} | Ganpati: {ganpatiName}</Typography>
      <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>Scan this QR code at the festival counter for quick verification</Typography>
    </Box>
  );
}