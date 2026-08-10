import 'dotenv/config';

// JWT settings — mirrors the token scheme used across the app.
// Access token is short-lived; refresh token is long-lived and rotated.
export const authConfig = {
  jwtSecret: process.env.JWT_SECRET || 'secretkey',
  // seconds
  accessExpiresIn: parseInt(process.env.JWT_EXPIRES_IN || '3600', 10), // 1 hour
  refreshExpiresIn: parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '86400', 10), // 24 hours
};
