// src/pages/WebsitePages/ContactUs.tsx
import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import { Phone, Email, LocationOn, Facebook, Instagram, Twitter } from '@mui/icons-material';
import { showSnackbar } from '@/components/uncontrolled/ToastMessage';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        showSnackbar('success', 'Message sent successfully!');
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch  {
      showSnackbar('error', 'Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  const contactInfo = [
    { icon: <Phone />, title: 'Phone', details: ['+91 98765 43210', '+91 98765 43211'] },
    { icon: <Email />, title: 'Email', details: ['info@siddhivinayakarts.com', 'support@siddhivinayakarts.com'] },
    { icon: <LocationOn />, title: 'Address', details: ['123, Ganpati Galli, Dadar West, Mumbai - 400028'] },
  ];

  return (
    <Box>
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 600 }}>
            Contact Us
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Get in touch with us for any queries or support
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          <Grid size={{xs:12, md:4}}>
            {contactInfo.map((info) => (
              <Card key={info.title} sx={{ mb: 3 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Box sx={{ color: 'primary.main' }}>{info.icon}</Box>
                    <Typography variant="h6">{info.title}</Typography>
                  </Box>
                  {info.details.map((detail) => (
                    <Typography key={detail} variant="body2" color="textSecondary">
                      {detail}
                    </Typography>
                  ))}
                </CardContent>
              </Card>
            ))}

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Follow Us</Typography>
                <Box display="flex" gap={1}>
                  <IconButton sx={{ color: '#1877f2' }}>
                    <Facebook />
                  </IconButton>
                  <IconButton sx={{ color: '#e4405f' }}>
                    <Instagram />
                  </IconButton>
                  <IconButton sx={{ color: '#1da1f2' }}>
                    <Twitter />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{xs:12, md:8}}>
            <Paper sx={{ p: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Send us a Message
              </Typography>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid size={{xs:12, sm:6}}>
                    <TextField
                      fullWidth
                      label="Your Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid size={{xs:12, sm:6}}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      label="Subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      label="Message"
                      multiline
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid size={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={submitting}
                      fullWidth
                    >
                      {submitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}