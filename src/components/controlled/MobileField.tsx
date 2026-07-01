import { TextField, InputAdornment, type SxProps, type Theme, type TextFieldProps } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { sanitizePhoneNumber, validatePhoneNumber } from '@/utils/RegexPattern';
import { useTranslation } from 'react-i18next';
import { getComponentTranslations } from '@/helpers/useTranslations';

type MobileFieldProps = TextFieldProps & {
  label: string;
  name: string;
  required?: boolean;
  sx?: SxProps<Theme>;
};

const MobileField: React.FC<MobileFieldProps> = ({ label, name, required = false, sx = {}, ...rest }) => {
  const {
    control,
    formState: { errors }
  } = useFormContext();

  const { t } = useTranslation();
  const trans = getComponentTranslations(t);

  return (
    <Controller
      name={name}
      control={control}
      rules={{
        required: required ? trans.mobileField.requiredError(label) : undefined,
        validate: (value: string = '') => {
          if (!value && required) return trans.mobileField.requiredError(label);
          if (!value) return true;
          const result = validatePhoneNumber(value);
          if (!result.valid) {
            return trans.mobileField.invalidFormat;
          }
          return true;
        }
      }}
      render={({ field }) => {
        const displayValue = field.value || '';
        const sanitizedValue = sanitizePhoneNumber(displayValue);
        
        return (
          <TextField
            {...field}
            {...rest}
            fullWidth
            label={label}
            value={sanitizedValue}
            error={!!errors[name]}
            helperText={String(errors[name]?.message || ' ')}
            onChange={(e) => {
              const rawInput = e.target.value;
              const cleaned = sanitizePhoneNumber(rawInput);
              field.onChange(cleaned);
            }}
            InputProps={{
              startAdornment: <InputAdornment position="start">+91</InputAdornment>
            }}
            required={required}
            sx={{ '& .MuiInputLabel-asterisk': { color: 'error.main' }, ...sx }}
          />
        );
      }}
    />
  );
};

export default MobileField;