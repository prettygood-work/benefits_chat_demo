// Dummy password hash for timing attack mitigation in auth
// This should match the hash algorithm used in generateHashedPassword
export const DUMMY_PASSWORD = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'; // SHA-256 of empty string
import { generateHashedPassword } from './db/utils';

export const isProductionEnvironment = process.env.NODE_ENV === 'production';
export const isDevelopmentEnvironment = process.env.NODE_ENV === 'development';

export const guestRegex = /^guest-\d+$/;

// Generate a secure random password for guest users
export async function generateGuestPassword(): Promise<string> {
  let randomBytes: Uint8Array;
  
  // Check if we're in Node.js environment
  if (typeof window === 'undefined') {
    // Server-side: Use Node.js crypto
    const { webcrypto } = await import('crypto');
    randomBytes = webcrypto.getRandomValues(new Uint8Array(32));
  } else {
    // Client-side: Use Web Crypto API
    if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
      throw new Error('Web Crypto API is not available in this environment.');
    }
    randomBytes = crypto.getRandomValues(new Uint8Array(32));
  }
  
  const randomString = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
  return await generateHashedPassword(randomString);
}
