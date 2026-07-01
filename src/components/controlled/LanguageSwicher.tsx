import React from 'react';
import { Select, MenuItem, type SelectChangeEvent } from '@mui/material';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();

  const handleChange = (event: SelectChangeEvent) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <Select
      value={i18n.language}
      onChange={handleChange}
      size="small"
      sx={{
        border: 'none',
        '&:hover': {
          boxShadow: 3,
          border: 'none'
        }
      }}
    >
      <MenuItem value="en">{t('language.en')}</MenuItem>
      <MenuItem value="mr">{t('language.mr')}</MenuItem>
      <MenuItem value="hi">{t('language.hi')}</MenuItem>
    </Select>
  );
};

export default LanguageSwitcher;