// src/pages/WebsitePages/AboutUs.tsx
import { Box, Container, Typography, Grid, Paper, Avatar } from '@mui/material';

export default function AboutUs() {
  const team = [
    { name: 'Rahul Patil', role: 'Founder', experience: '20+ years in traditional arts' },
    { name: 'Smita Patil', role: 'Creative Director', experience: '15+ years in design' },
    { name: 'Rajesh More', role: 'Master Craftsman', experience: '30+ years of expertise' },
  ];

  return (
    <Box>
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 600 }}>
            About Siddhivinayak Arts
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Preserving tradition through exquisite craftsmanship since 1995
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          <Grid size={{xs:12, md:6}}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              Our Story
            </Typography>
            <Typography variant="body1" paragraph>
              Siddhivinayak Arts was founded in 1995 with a vision to create eco-friendly,
              beautifully crafted Ganpati idols that bring joy and prosperity to every home.
            </Typography>
            <Typography variant="body1" paragraph>
              Over the past 28 years, we have served thousands of satisfied customers
              across Maharashtra. Our commitment to quality and traditional craftsmanship
              has made us a trusted name in the industry.
            </Typography>
            <Typography variant="body1">
              Today, we combine traditional techniques with modern technology to offer
              a seamless booking experience while maintaining the highest standards of
              artistry and environmental responsibility.
            </Typography>
          </Grid>
          <Grid size={{xs:12, md:6}}>
            <Box
              component="img"
              src="/about-image.jpg"
              alt="About Us"
              sx={{ width: '100%', borderRadius: 4 }}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 6 }}>
          <Typography variant="h4" textAlign="center" gutterBottom sx={{ fontWeight: 600 }}>
            Our Team
          </Typography>
          <Typography variant="body1" textAlign="center" color="textSecondary" sx={{ mb: 4 }}>
            Meet the passionate minds behind Siddhivinayak Arts
          </Typography>

          <Grid container spacing={3}>
            {team.map((member) => (
              <Grid size={{xs:12, sm:6,md:4}} key={member.name}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Avatar sx={{ width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}>
                    {member.name.charAt(0)}
                  </Avatar>
                  <Typography variant="h6">{member.name}</Typography>
                  <Typography variant="subtitle2" color="primary" gutterBottom>{member.role}</Typography>
                  <Typography variant="body2" color="textSecondary">{member.experience}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ mt: 6, bgcolor: '#f5f5f5', p: 4, borderRadius: 4 }}>
          <Typography variant="h5" gutterBottom textAlign="center">
            Our Mission
          </Typography>
          <Typography variant="body1" textAlign="center">
            To provide eco-friendly, beautifully crafted Ganpati idols while ensuring a
            seamless and transparent booking experience for all our customers.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}