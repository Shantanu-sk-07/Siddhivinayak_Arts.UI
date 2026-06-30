import React, { useState, useEffect } from 'react';
import { 
  IconButton, 
  Menu, 
  MenuItem, 
  Typography, 
  useTheme, 
  alpha, 
  Box, 
  Tooltip,
  Chip,
  Fade,
} from '@mui/material';
import { 
  Language as LanguageIcon, 
  Check as CheckIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface LanguageOption {
  code: string;
  label: string;
  labelEn: string;
  flag: string;
  nativeLabel: string;
}

const languages: LanguageOption[] = [
  { 
    code: 'mr', 
    label: 'Marathi', 
    labelEn: 'Marathi',
    nativeLabel: 'मराठी', 
    flag: '🇮🇳' 
  },
  { 
    code: 'en', 
    label: 'English', 
    labelEn: 'English',
    nativeLabel: 'English', 
    flag: '🇬🇧' 
  },
  { 
    code: 'hi', 
    label: 'Hindi', 
    labelEn: 'Hindi',
    nativeLabel: 'हिन्दी', 
    flag: '🇮🇳' 
  },
];

interface LanguageSwitcherProps {
  variant?: 'icon' | 'chip' | 'select';
  size?: 'small' | 'medium';
  showLabel?: boolean;
  className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  variant = 'icon',
  size = 'medium',
  showLabel = true,
  className
}) => {
  const { i18n, t } = useTranslation();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];
  const isOpen = Boolean(anchorEl);

  useEffect(() => {
    const savedLang = localStorage.getItem('preferred-language');
    if (savedLang && languages.some(l => l.code === savedLang)) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  const handleClick = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (langCode?: string): void => {
    if (langCode) {
      i18n.changeLanguage(langCode);
      localStorage.setItem('preferred-language', langCode);
    }
    setAnchorEl(null);
  };

  const getSizeStyles = () => {
    switch(size) {
      case 'small':
        return { padding: '4px 10px', fontSize: '0.7rem', gap: 0.5 };
      default:
        return { padding: '6px 14px', fontSize: '0.8rem', gap: 0.75 };
    }
  };

  // Compact Menu Items
  const menuItems = (
    <AnimatePresence>
      {languages.map((lang, index) => {
        const isSelected = i18n.language === lang.code;
        return (
          <motion.div
            key={lang.code}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <MenuItem
              onClick={() => handleClose(lang.code)}
              selected={isSelected}
              sx={{
                borderRadius: 1.5,
                padding: theme.spacing(1, 1.5),
                gap: 1.5,
                marginBottom: 0.25,
                minHeight: 40,
                transition: 'all 0.2s ease',
                background: isSelected 
                  ? alpha(theme.palette.primary.main, 0.06)
                  : 'transparent',
                '&:hover': {
                  background: isSelected
                    ? alpha(theme.palette.primary.main, 0.1)
                    : alpha(theme.palette.action.hover, 0.04),
                },
                '&.Mui-selected': {
                  background: alpha(theme.palette.primary.main, 0.08),
                  color: theme.palette.primary.main,
                  '&:hover': {
                    background: alpha(theme.palette.primary.main, 0.12),
                  },
                },
              }}
            >
              <Typography variant="body2" sx={{ fontSize: '1.1rem', lineHeight: 1 }}>
                {lang.flag}
              </Typography>
              <Typography 
                variant="body2" 
                fontWeight={isSelected ? 600 : 400}
                sx={{
                  flex: 1,
                  fontSize: '0.85rem',
                  color: isSelected ? theme.palette.primary.main : theme.palette.text.primary,
                }}
              >
                {lang.nativeLabel}
              </Typography>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  <CheckIcon 
                    sx={{ 
                      color: theme.palette.primary.main,
                      fontSize: 16,
                    }} 
                  />
                </motion.div>
              )}
            </MenuItem>
          </motion.div>
        );
      })}
    </AnimatePresence>
  );

  // Chip variant
  if (variant === 'chip') {
    return (
      <>
        <Chip
          icon={<LanguageIcon />}
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <span>{showLabel ? currentLang.nativeLabel : currentLang.flag}</span>
              {isOpen ? <ArrowUpIcon sx={{ fontSize: 16 }} /> : <ArrowDownIcon sx={{ fontSize: 16 }} />}
            </Box>
          }
          onClick={handleClick}
          sx={{
            borderRadius: 2,
            background: alpha(theme.palette.primary.main, 0.06),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            color: theme.palette.text.primary,
            fontWeight: 500,
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            '&:hover': {
              background: alpha(theme.palette.primary.main, 0.1),
              borderColor: alpha(theme.palette.primary.main, 0.2),
            },
            '& .MuiChip-icon': {
              color: theme.palette.primary.main,
              fontSize: 18,
            },
            ...getSizeStyles(),
          }}
        />

        <Menu
          anchorEl={anchorEl}
          open={isOpen}
          onClose={() => handleClose()}
          TransitionComponent={Fade}
          transitionDuration={250}
          PaperProps={{
            sx: {
              borderRadius: 2.5,
              minWidth: 140,
              mt: 0.5,
              boxShadow: `0 8px 30px ${alpha(theme.palette.common.black, 0.12)}`,
              background: theme.palette.background.paper,
              border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
              padding: theme.spacing(0.75),
            },
          }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          {menuItems}
        </Menu>
      </>
    );
  }

  // Select variant (Dropdown style)
  if (variant === 'select') {
    return (
      <>
        <Box
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            // gap: 0.75,
            // padding: size === 'small' ? '4px 10px' : '6px 14px',
            borderRadius: 2,
            background: isHovered || isOpen
              ? alpha(theme.palette.primary.main, 0.08)
              : alpha(theme.palette.action.hover, 0.04),
            border: `1px solid ${isHovered || isOpen
              ? alpha(theme.palette.primary.main, 0.2)
              : alpha(theme.palette.divider, 0.08)}`,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              background: alpha(theme.palette.primary.main, 0.1),
              borderColor: alpha(theme.palette.primary.main, 0.25),
            },
            ...getSizeStyles(),
          }}
        >
          <Typography variant="body2" sx={{ fontSize: '1rem', lineHeight: 1 }}>
            {currentLang.flag}
          </Typography>
          {showLabel && (
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 500,
                fontSize: size === 'small' ? '0.75rem' : '0.85rem',
                color: theme.palette.text.primary,
              }}
            >
              {currentLang.nativeLabel}
            </Typography>
          )}
          {isOpen ? (
            <ArrowUpIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
          ) : (
            <ArrowDownIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
          )}
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={isOpen}
          onClose={() => handleClose()}
          TransitionComponent={Fade}
          transitionDuration={250}
          PaperProps={{
            sx: {
              borderRadius: 2.5,
              minWidth: 140,
              mt: 0.5,
              boxShadow: `0 8px 30px ${alpha(theme.palette.common.black, 0.12)}`,
              background: theme.palette.background.paper,
              border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
              padding: theme.spacing(0.75),
            },
          }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
          {menuItems}
        </Menu>
      </>
    );
  }

  // Icon variant (default - compact)
  return (
    <>
      <Tooltip title={t('language.switch', 'Switch Language')} arrow placement="bottom">
        <IconButton
          onClick={handleClick}
          size={size}
          className={className}
          sx={{
            color: theme.palette.text.primary,
            background: isOpen 
              ? alpha(theme.palette.primary.main, 0.1)
              : alpha(theme.palette.action.hover, 0.04),
            padding: size === 'small' ? '4px 8px' : '6px 12px',
            borderRadius: 2,
            transition: 'all 0.2s ease',
            border: `1px solid ${isOpen 
              ? alpha(theme.palette.primary.main, 0.2) 
              : alpha(theme.palette.divider, 0.06)}`,
            '&:hover': {
              background: alpha(theme.palette.primary.main, 0.1),
              borderColor: alpha(theme.palette.primary.main, 0.2),
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <LanguageIcon 
              fontSize={size === 'small' ? 'small' : 'medium'} 
              sx={{ 
                color: isOpen ? theme.palette.primary.main : theme.palette.text.secondary,
                fontSize: size === 'small' ? 18 : 20,
              }} 
            />
            
            {showLabel && (
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 500,
                  display: { xs: 'none', sm: 'inline' },
                  color: theme.palette.text.primary,
                  fontSize: size === 'small' ? '0.7rem' : '0.8rem',
                }}
              >
                {currentLang.nativeLabel}
              </Typography>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {isOpen ? (
                <ArrowUpIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
              ) : (
                <ArrowDownIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
              )}
            </Box>
          </Box>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={isOpen}
        onClose={() => handleClose()}
        TransitionComponent={Fade}
        transitionDuration={250}
        PaperProps={{
          sx: {
            borderRadius: 2.5,
            minWidth: 140,
            mt: 0.5,
            boxShadow: `0 8px 30px ${alpha(theme.palette.common.black, 0.12)}`,
            background: theme.palette.background.paper,
            border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
            padding: theme.spacing(0.75),
          },
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {menuItems}
      </Menu>
    </>
  );
};

export default LanguageSwitcher;