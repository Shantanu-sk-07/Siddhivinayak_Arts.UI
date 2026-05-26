// src/view/DashboardPages/SuperAdmin/PaymentVerification.tsx
import { useState, useEffect, JSX } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { Check, Close, Visibility } from '@mui/icons-material';
import { UniversalTable, Column } from '@/components/uncontrolled/UniversalTable';
import { showSnackbar, showConfirmation } from '@/components/uncontrolled/ToastMessage';
import { Payment, Booking } from '@/types';

interface PaymentWithBooking extends Payment {
  booking?: Booking;
}

// Convert PaymentWithBooking to Record<string, unknown> type
type PaymentRecord = PaymentWithBooking & Record<string, unknown>;

interface PaymentsResponse {
  success: boolean;
  data: PaymentWithBooking[];
}

interface VerifyPaymentResponse {
  success: boolean;
  message?: string;
}

export default function PaymentVerification() {
  const [payments, setPayments] = useState<PaymentWithBooking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithBooking | null>(null);
  const [screenshotOpen, setScreenshotOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/payments/pending');
      const data: PaymentsResponse = await response.json();
      if (data.success && data.data) {
        setPayments(data.data);
      }
    } catch {
      showSnackbar('error', 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (payment: PaymentWithBooking, status: 'VERIFIED' | 'REJECTED'): Promise<void> => {
    const confirmed = await showConfirmation({
      message: status === 'VERIFIED' 
        ? `Verify payment of ₹${payment.amount} from ${payment.booking?.customerName || 'Customer'}?`
        : `Reject payment of ₹${payment.amount}?`,
      title: status === 'VERIFIED' ? 'Verify Payment' : 'Reject Payment',
      confirmText: status === 'VERIFIED' ? 'Verify' : 'Reject',
      confirmColor: status === 'VERIFIED' ? 'success' : 'error',
    });

    if (confirmed) {
      try {
        const response = await fetch(`/api/admin/payments/${payment.id}/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });
        const data: VerifyPaymentResponse = await response.json();
        if (data.success) {
          showSnackbar('success', `Payment ${status.toLowerCase()} successfully`);
          await fetchPayments();
        }
      } catch {
        showSnackbar('error', 'Failed to verify payment');
      }
    }
  };

  const viewScreenshot = (payment: PaymentWithBooking): void => {
    setSelectedPayment(payment);
    setScreenshotOpen(true);
  };

  // Define columns for UniversalTable using PaymentRecord type
  const columns: Column<PaymentRecord>[] = [
    { key: 'id' as keyof PaymentRecord, label: 'Payment ID' },
    { key: 'bookingId' as keyof PaymentRecord, label: 'Booking ID' },
    { 
      key: 'booking' as keyof PaymentRecord, 
      label: 'Customer',
      render: (row: PaymentRecord): string => (row as PaymentWithBooking).booking?.customerName || 'N/A'
    },
    { 
      key: 'amount' as keyof PaymentRecord, 
      label: 'Amount',
      render: (row: PaymentRecord): string => `₹${(row as PaymentWithBooking).amount.toLocaleString()}`
    },
    { 
      key: 'paymentType' as keyof PaymentRecord, 
      label: 'Type',
      render: (row: PaymentRecord): JSX.Element => {
        const payment = row as PaymentWithBooking;
        return (
          <Chip 
            label={payment.paymentType} 
            size="small"
            color={payment.paymentType === 'ADVANCE' ? 'primary' : 'default'}
          />
        );
      }
    },
    { 
      key: 'paymentMethod' as keyof PaymentRecord, 
      label: 'Method',
      render: (row: PaymentRecord): JSX.Element => {
        const payment = row as PaymentWithBooking;
        return (
          <Chip 
            label={payment.paymentMethod.replace('_', ' ')} 
            size="small"
            variant="outlined"
          />
        );
      }
    },
    { 
      key: 'screenshot' as keyof PaymentRecord, 
      label: 'Proof',
      render: (row: PaymentRecord): JSX.Element | string => {
        const payment = row as PaymentWithBooking;
        return payment.screenshot ? (
          <IconButton size="small" onClick={() => viewScreenshot(payment)}>
            <Visibility fontSize="small" />
          </IconButton>
        ) : 'N/A';
      }
    },
    { 
      key: 'createdAt' as keyof PaymentRecord, 
      label: 'Date',
      render: (row: PaymentRecord): string => new Date((row as PaymentWithBooking).createdAt).toLocaleDateString()
    },
    {
      key: 'actionbutton',
      label: 'Actions',
      render: (row: PaymentRecord): JSX.Element => {
        const payment = row as PaymentWithBooking;
        return (
          <Box display="flex" gap={1}>
            <IconButton 
              size="small" 
              color="success" 
              onClick={() => handleVerify(payment, 'VERIFIED')}
            >
              <Check fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              color="error" 
              onClick={() => handleVerify(payment, 'REJECTED')}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
        );
      },
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Payment Verification
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Verify offline payments submitted by customers
      </Typography>

      <Paper sx={{ p: 3 }}>
        <UniversalTable<PaymentRecord>
          data={payments as PaymentRecord[]}
          columns={columns}
          loading={loading}
          rowsPerPage={10}
          showSearch
        />
      </Paper>

      {/* Screenshot Dialog */}
      <Dialog open={screenshotOpen} onClose={() => setScreenshotOpen(false)} maxWidth="md" fullWidth>
        {selectedPayment && (
          <>
            <DialogTitle>
              Payment Screenshot
              <Typography variant="body2" color="textSecondary">
                Booking ID: {selectedPayment.bookingId} | Amount: ₹{selectedPayment.amount.toLocaleString()}
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Box textAlign="center">
                {selectedPayment.screenshot && (
                  <img 
                    src={selectedPayment.screenshot} 
                    alt="Payment Screenshot"
                    style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 8 }}
                  />
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setScreenshotOpen(false)}>Close</Button>
              <Button 
                variant="contained" 
                color="success"
                onClick={() => {
                  setScreenshotOpen(false);
                  handleVerify(selectedPayment, 'VERIFIED');
                }}
              >
                Verify Payment
              </Button>
              <Button 
                variant="contained" 
                color="error"
                onClick={() => {
                  setScreenshotOpen(false);
                  handleVerify(selectedPayment, 'REJECTED');
                }}
              >
                Reject Payment
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}