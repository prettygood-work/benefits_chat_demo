import { generateId } from 'ai';

// Universal password hashing compatible with both Node.js and Edge
export async function generateHashedPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  
  let hashBuffer: ArrayBuffer;
  
  // Check if we're in Node.js environment
  if (typeof window === 'undefined') {
    // Server-side: Use Node.js crypto
    const { webcrypto } = await import('crypto');
    hashBuffer = await webcrypto.subtle.digest('SHA-256', data);
  } else {
    // Client-side: Use Web Crypto API
    if (typeof crypto === 'undefined' || !crypto.subtle) {
      throw new Error('Web Crypto API is not available in this environment.');
    }
    hashBuffer = await crypto.subtle.digest('SHA-256', data);
  }
  
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Note: This is SHA-256, not bcrypt. For production, use a slow hash (e.g., PBKDF2, scrypt, or argon2) if available in your runtime.

// Removed generateDummyPassword - use generateGuestPassword from constants instead
