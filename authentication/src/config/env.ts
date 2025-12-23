// Environment configuration
export const env = {
  AUTH_SECRET: process.env.AUTH_SECRET || 'your_auth_secret_here_minimum_32_characters_long',
  DATABASE_URL: process.env.DATABASE_URL || '',
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || '3001',
  AUTH_URL: process.env.AUTH_URL || 'http://localhost:3001',
  FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@yourdomain.com'
};
