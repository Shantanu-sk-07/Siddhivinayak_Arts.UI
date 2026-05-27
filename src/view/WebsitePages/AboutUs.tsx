// src/pages/WebsitePages/AboutUs.tsx
import { Box, Container, Typography, Grid, Paper, Avatar, useTheme, alpha, styled } from '@mui/material';
import { motion } from 'framer-motion';
import { Forest, EmojiEmotions, History, Star, WorkspacePremium } from '@mui/icons-material';
import Logo from '@/assets/Logo.jfif';

const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `url(${Logo})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: 0.08,
    pointerEvents: 'none',
  },
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  background: alpha(theme.palette.common.white, 0.95),
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 10px 30px ${alpha(theme.palette.common.black, 0.1)}`,
  },
}));

const TeamCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.15)}`,
  },
}));

const ValueCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
  borderRadius: 16,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
  },
}));

export default function AboutUs() {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();
  const yearsInBusiness = currentYear - 1995;

  const team = [
    { name: 'Rahul Patil', role: 'Founder & CEO', experience: '20+ years in traditional arts', icon: <EmojiEmotions /> },
    { name: 'Smita Patil', role: 'Creative Director', experience: '15+ years in design', icon: <Star /> },
    { name: 'Rajesh More', role: 'Master Craftsman', experience: '30+ years of expertise', icon: <WorkspacePremium /> },
  ];

  const stats = [
    { value: yearsInBusiness, label: 'Years of Excellence', icon: <History sx={{ fontSize: 40 }} /> },
    { value: '10K+', label: 'Happy Customers', icon: <EmojiEmotions sx={{ fontSize: 40 }} /> },
    { value: '500+', label: 'Unique Designs', icon: <Forest sx={{ fontSize: 40 }} /> },
    { value: '100%', label: 'Eco-Friendly', icon: <Star sx={{ fontSize: 40 }} /> },
  ];

  const values = [
    { title: 'Quality First', desc: 'Uncompromising quality in every idol we create' },
    { title: 'Eco-Friendly', desc: 'Using sustainable materials and processes' },
    { title: 'Customer Satisfaction', desc: 'Your happiness is our priority' },
    { title: 'Traditional Artistry', desc: 'Preserving age-old craftsmanship' },
  ];

  return (
    <Box>
      <HeroSection>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 }, position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Box display="flex" alignItems="center" gap={2} mb={3} justifyContent="center">
              <Forest sx={{ fontSize: 50 }} />
            </Box>
            <Typography 
              variant="h2" 
              gutterBottom 
              sx={{ 
                fontWeight: 800, 
                textAlign: 'center',
                fontSize: { xs: '2rem', md: '3.5rem' }
              }}
            >
              About Siddhivinayak Arts
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                opacity: 0.9, 
                textAlign: 'center',
                maxWidth: 700,
                mx: 'auto'
              }}
            >
              Preserving tradition through exquisite craftsmanship since 1995
            </Typography>
          </motion.div>
        </Container>
      </HeroSection>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
                Our Story
              </Typography>
              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                Siddhivinayak Arts was founded in 1995 with a vision to create eco-friendly,
                beautifully crafted Ganpati idols that bring joy and prosperity to every home.
              </Typography>
              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                Over the past {yearsInBusiness} years, we have served thousands of satisfied customers
                across Maharashtra. Our commitment to quality and traditional craftsmanship
                has made us a trusted name in the industry.
              </Typography>
              <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                Today, we combine traditional techniques with modern technology to offer
                a seamless booking experience while maintaining the highest standards of
                artistry and environmental responsibility.
              </Typography>
            </motion.div>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Box
                component="img"
                src={Logo}
                alt="About Us"
                sx={{ 
                  width: '100%', 
                  borderRadius: 4,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                }}
              />
            </motion.div>
          </Grid>
        </Grid>

        <Box sx={{ mt: 8 }}>
          <Grid container spacing={3}>
            {stats.map((stat, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <StatCard>
                    <Box sx={{ color: theme.palette.secondary.main, mb: 2 }}>
                      {stat.icon}
                    </Box>
                    <Typography variant="h3" fontWeight={700} color="primary">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {stat.label}
                    </Typography>
                  </StatCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ mt: 8 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Typography variant="h3" textAlign="center" gutterBottom sx={{ fontWeight: 700 }}>
              Our Core Values
            </Typography>
            <Typography variant="body1" textAlign="center" color="textSecondary" sx={{ mb: 5, maxWidth: 600, mx: 'auto' }}>
              The principles that guide everything we do
            </Typography>
          </motion.div>

          <Grid container spacing={3}>
            {values.map((value, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <ValueCard>
                    <Typography variant="h5" gutterBottom color="primary" fontWeight={600}>
                      {value.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {value.desc}
                    </Typography>
                  </ValueCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ mt: 8 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Typography variant="h3" textAlign="center" gutterBottom sx={{ fontWeight: 700 }}>
              Our Team
            </Typography>
            <Typography variant="body1" textAlign="center" color="textSecondary" sx={{ mb: 5, maxWidth: 600, mx: 'auto' }}>
              Meet the passionate minds behind Siddhivinayak Arts
            </Typography>
          </motion.div>

          <Grid container spacing={3}>
            {team.map((member, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={member.name}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <TeamCard>
                    <Avatar 
                      sx={{ 
                        width: 120, 
                        height: 120, 
                        mx: 'auto', 
                        mb: 2, 
                        bgcolor: theme.palette.primary.main,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      }}
                    >
                      {member.name.charAt(0)}
                    </Avatar>
                    <Typography variant="h5" fontWeight={600} gutterBottom>
                      {member.name}
                    </Typography>
                    <Typography variant="subtitle1" color="primary" fontWeight={500} gutterBottom>
                      {member.role}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {member.experience}
                    </Typography>
                    <Box mt={2}>
                      {member.icon}
                    </Box>
                  </TeamCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Box sx={{ mt: 6, bgcolor: alpha(theme.palette.primary.main, 0.05), p: 5, borderRadius: 4, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom fontWeight={700} color="primary">
              Our Mission
            </Typography>
            <Typography variant="h6" sx={{ maxWidth: 800, mx: 'auto', lineHeight: 1.8 }}>
              To provide eco-friendly, beautifully crafted Ganpati idols while ensuring a
              seamless and transparent booking experience for all our customers.
            </Typography>
            <Box mt={3}>
              <Forest sx={{ fontSize: 50, color: theme.palette.secondary.main, opacity: 0.5 }} />
            </Box>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}