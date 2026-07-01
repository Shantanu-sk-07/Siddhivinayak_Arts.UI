/* eslint-disable react-refresh/only-export-components */
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const emailDomainRegex = /^[^\s@]+@[^\s@.]+\.(com|org|net)$/;

export const SanitizeEmailRegex = (value: string) => value.replace(/[^A-Za-z0-9@.+-]/g, '').trim();

export const aadharRegex = /^[2-9]{1}[0-9]{11}$/;
export const formatAadhar = (value: string) => value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');

export const TextRegexPattern = {
  string: {
    regex: /^[A-Za-z]+$/,
    allowed: /[A-Za-z]/g,
    messageKey: 'validation.only_letters'
  },
  numbers: {
    regex: /^[0-9%.]+$/,
    allowed: /[0-9%.]/g,
    messageKey: 'validation.only_numbers_percent'
  },
  alphabet: {
    regex: /^[A-Za-z ]+$/,
    allowed: /[A-Za-z ]/g,
    messageKey: 'validation.only_alphabets'
  },
  alphanumeric: {
    regex: /^[A-Za-z0-9]+$/,
    allowed: /[A-Za-z0-9]/g,
    messageKey: 'validation.only_alphanumeric'
  },
  textarea: {
    regex: /^[\x20-\x7E\r\n]+$/,
    allowed: /[\x20-\x7E\r\n]/g,
    messageKey: 'validation.invalid_format'
  },
  all: {
    regex: /^[\s\S]*$/,
    allowed: /[\s\S]/g,
    messageKey: 'validation.invalid_format'
  }
} as const;

export type InputType = keyof typeof TextRegexPattern;

export const mobileRegex = /^[6-9]{1}[0-9]{9}$/;
export const mobileRegexWithZero = /^[0]{1}[6-9]{1}[0-9]{9}$/;
export const mobileRegexWithCountryCode = /^[+]{1}[9]{1}[1]{1}[6-9]{1}[0-9]{9}$/;

export const numericRegex = /^[0-9]+$/;
export const decimalRegex = /^[0-9]*\.?[0-9]*$/;

export const emojiRegex = /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF])/gu;
export const removeEmojis = (text: string): string => text.replace(emojiRegex, '');

export const sanitizePhoneNumber = (value: string): string => {
  let cleaned = value.replace(/\D/g, '');
  
  if (cleaned.startsWith('91')) {
    cleaned = cleaned.substring(2);
  }
  
  if (cleaned.length > 10) {
    cleaned = cleaned.substring(0, 10);
  }
  
  if (cleaned.length === 10) {
    const firstDigit = parseInt(cleaned.charAt(0));
    if (firstDigit >= 6 && firstDigit <= 9) {
      return cleaned;
    }
    let validNumber = '';
    for (let i = 0; i < cleaned.length; i++) {
      const digit = parseInt(cleaned.charAt(i));
      if (digit >= 6 && digit <= 9) {
        const remaining = cleaned.substring(i);
        if (remaining.length >= 10) {
          validNumber = remaining.substring(0, 10);
          break;
        }
      }
    }
    if (validNumber.length === 10) {
      return validNumber;
    }
    return cleaned;
  }
  
  return cleaned;
};

export const validatePhoneNumber = (value: string): { valid: boolean; sanitized: string; errorKey?: string } => {
  const sanitized = sanitizePhoneNumber(value);
  
  if (!sanitized || sanitized.length === 0) {
    return { valid: false, sanitized: '', errorKey: 'validation.invalid_phone' };
  }
  
  if (sanitized.length !== 10) {
    return { valid: false, sanitized, errorKey: 'validation.invalid_phone' };
  }
  
  if (!mobileRegex.test(sanitized)) {
    return { valid: false, sanitized, errorKey: 'validation.invalid_phone' };
  }
  
  return { valid: true, sanitized };
};

export const PasswordRegex = {
  basic: {
    regex: /^.{8,32}$/,
    messageKey: 'validation.password_basic'
  },
  withCase: {
    regex: /^(?=.*[a-z])(?=.*[A-Z]).{8,32}$/,
    messageKey: 'validation.password_case'
  },
  withNumber: {
    regex: /^(?=.*\d).{8,32}$/,
    messageKey: 'validation.password_number'
  },
  withSpecialChar: {
    regex: /^(?=.*[^A-Za-z0-9]).{8,32}$/,
    messageKey: 'validation.password_special'
  },
  strong: {
    regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,32}$/,
    messageKey: 'validation.password_strong'
  }
} as const;

export const checkPasswordStrength = (password: string): number => {
  if (!password) return 0;
  let strength = 0;
  if (password.length >= 8) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[a-z]/.test(password)) strength += 1;
  if (/\d/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;
  return strength;
};

export const getPasswordStrengthLabel = (password: string): { label: string; color: string } => {
  const strength = checkPasswordStrength(password);
  if (strength === 0) return { label: 'Very Weak', color: 'error.main' };
  if (strength === 1) return { label: 'Weak', color: 'warning.main' };
  if (strength === 2) return { label: 'Moderate', color: 'info.main' };
  if (strength === 3) return { label: 'Strong', color: 'success.main' };
  return { label: 'Very Strong', color: 'success.dark' };
};