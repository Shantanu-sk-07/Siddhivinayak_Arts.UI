// import { useState } from 'react';
// import { Box, Container, Typography, Paper, Avatar, Grid, TextField, Button, Divider, useTheme, alpha, styled, Chip, IconButton } from '@mui/material';
// import { motion } from 'framer-motion';
// import { Person as PersonIcon, Email as EmailIcon, Phone as PhoneIcon, Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon, Badge as BadgeIcon, CalendarToday as CalendarIcon } from '@mui/icons-material';
// import { useTranslation } from 'react-i18next';
// import { showSnackbar } from '@/components/uncontrolled/ToastMessage';

// const GlassPaper = styled(Paper)(({ theme }) => ({
//   background: alpha(theme.palette.common.white, 0.95),
//   backdropFilter: 'blur(10px)',
//   borderRadius: 16,
//   padding: theme.spacing(3),
// }));

// const StyledAvatar = styled(Avatar)(({ theme }) => ({
//   width: 120,
//   height: 120,
//   background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
//   border: `4px solid ${alpha(theme.palette.common.white, 0.5)}`,
//   boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
// }));

// interface StatItem {
//   label: string;
//   value: string;
//   icon: React.ReactNode;
// }

// export default function Profile() {
//   const { t } = useTranslation();
//   const theme = useTheme();
//   const [isEditing, setIsEditing] = useState<boolean>(false);
//   const [formData, setFormData] = useState({
//     name: user?.name || 'Super Admin',
//     email: user?.email || 'admin@gmail.com',
//     phone: user?.phone || '+91 98765 43210',
//   });

//   const handleSave = (): void => {
//     showSnackbar('success', t('msg.update_success'));
//     setIsEditing(false);
//   };

//   const stats: StatItem[] = [
//     { label: t('common.role'), value: user?.role || 'SUPER_ADMIN', icon: <BadgeIcon /> },
//     { label: t('common.member_since'), value: '2024', icon: <CalendarIcon /> },
//   ];

//   return (
//     <Container maxWidth="lg" sx={{ py: 4 }}>
//       <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
//         <Typography variant="h4" fontWeight={700} gutterBottom>
//           {t('nav.profile')}
//         </Typography>
//         <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
//           {t('common.manage_info')}
//         </Typography>

//         <Grid container spacing={3}>
//           <Grid size={{ xs: 12, md: 4 }}>
//             <GlassPaper sx={{ textAlign: 'center' }}>
//               <motion.div
//                 initial={{ scale: 0 }}
//                 animate={{ scale: 1 }}
//                 transition={{ duration: 0.5, type: 'spring' }}
//               >
//                 <StyledAvatar sx={{ mx: 'auto', mb: 2 }}>
//                   {formData.name.charAt(0).toUpperCase()}
//                 </StyledAvatar>
//               </motion.div>
//               <Typography variant="h5" fontWeight={600} gutterBottom>
//                 {formData.name}
//               </Typography>
//               <Chip
//                 label={user?.role || 'SUPER_ADMIN'}
//                 color="primary"
//                 size="small"
//                 sx={{ mb: 2 }}
//               />
//               <Divider sx={{ my: 2 }} />
//               {stats.map((stat, index) => (
//                 <Box key={index} display="flex" alignItems="center" gap={2} mb={2}>
//                   <Box sx={{ color: theme.palette.primary.main }}>{stat.icon}</Box>
//                   <Box textAlign="left">
//                     <Typography variant="caption" color="textSecondary" display="block">
//                       {stat.label}
//                     </Typography>
//                     <Typography variant="body1" fontWeight={600}>
//                       {stat.value}
//                     </Typography>
//                   </Box>
//                 </Box>
//               ))}
//             </GlassPaper>
//           </Grid>

//           <Grid size={{ xs: 12, md: 8 }}>
//             <GlassPaper>
//               <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
//                 <Typography variant="h5" fontWeight={600}>
//                   {t('common.personal_info')}
//                 </Typography>
//                 {!isEditing ? (
//                   <Button
//                     startIcon={<EditIcon />}
//                     variant="outlined"
//                     onClick={() => setIsEditing(true)}
//                     sx={{ borderRadius: 50 }}
//                   >
//                     {t('button.edit')}
//                   </Button>
//                 ) : (
//                   <Box display="flex" gap={1}>
//                     <IconButton
//                       onClick={() => setIsEditing(false)}
//                       sx={{ color: theme.palette.error.main }}
//                     >
//                       <CancelIcon />
//                     </IconButton>
//                     <IconButton
//                       onClick={handleSave}
//                       sx={{ color: theme.palette.success.main }}
//                     >
//                       <SaveIcon />
//                     </IconButton>
//                   </Box>
//                 )}
//               </Box>

//               <Grid container spacing={3}>
//                 <Grid size={12}>
//                   <TextField
//                     fullWidth
//                     label={t('customer.name')}
//                     value={formData.name}
//                     disabled={!isEditing}
//                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                     InputProps={{
//                       startAdornment: (
//                         <PersonIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
//                       ),
//                     }}
//                   />
//                 </Grid>
//                 <Grid size={12}>
//                   <TextField
//                     fullWidth
//                     label={t('customer.email')}
//                     type="email"
//                     value={formData.email}
//                     disabled={!isEditing}
//                     onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                     InputProps={{
//                       startAdornment: (
//                         <EmailIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
//                       ),
//                     }}
//                   />
//                 </Grid>
//                 <Grid size={12}>
//                   <TextField
//                     fullWidth
//                     label={t('customer.phone')}
//                     value={formData.phone}
//                     disabled={!isEditing}
//                     onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
//                     InputProps={{
//                       startAdornment: (
//                         <PhoneIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
//                       ),
//                     }}
//                   />
//                 </Grid>
//               </Grid>
//             </GlassPaper>
//           </Grid>
//         </Grid>
//       </motion.div>
//     </Container>
//   );
// }

function Profile() {
  return (
    <div>
      
    </div>
  )
}

export default Profile
