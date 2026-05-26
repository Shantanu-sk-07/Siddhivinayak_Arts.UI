// src/constants/config.ts
export const config = {
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  RAZORPAY_KEY: process.env.REACT_APP_RAZORPAY_KEY || '',
  CLOUDINARY_CLOUD_NAME: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_UPLOAD_PRESET: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || '',
  APP_NAME: 'Siddhivinayak Arts',
  APP_VERSION: '1.0.0',
  CONTACT_PHONE: '+91 98765 43210',
  CONTACT_EMAIL: 'info@siddhivinayakarts.com',
  ADVANCE_PERCENTAGE: 30,
  MAX_FILE_SIZE_MB: 10,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
};