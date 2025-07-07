import { generateHashedPassword } from './db/utils';

// Dummy password hash for timing attack mitigation in auth
// This is a static PBKDF2 hash that matches our hashing format
export const DUMMY_PASSWORD = '0123456789abcdef0123456789abcdef' + // 16 bytes salt (hex)
                              'fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210'; // 32 bytes hash (hex)

export const isProductionEnvironment = process.env.NODE_ENV === 'production';
export const isDevelopmentEnvironment = process.env.NODE_ENV === 'development';

export const guestRegex = /^guest-\d+$/;

// Generate a secure random password for guest users using Web Crypto API
export async function generateGuestPassword(): Promise<string> {
  // Generate 32 random bytes for password
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  const randomString = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
  return await generateHashedPassword(randomString);
}
