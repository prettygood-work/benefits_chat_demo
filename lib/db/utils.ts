import { generateId } from 'ai';

// Edge-compatible password hashing using PBKDF2 (more secure than plain SHA-256)
export async function generateHashedPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordData,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  
  // Derive key using PBKDF2 with 100,000 iterations
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256 // 32 bytes
  );
  
  // Combine salt and hash for storage
  const hashArray = new Uint8Array(salt.length + derivedBits.byteLength);
  hashArray.set(salt);
  hashArray.set(new Uint8Array(derivedBits), salt.length);
  
  // Convert to hex string
  return Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Verify password against stored hash
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    
    // Convert stored hash back to bytes
    const hashBytes = new Uint8Array(
      storedHash.match(/.{2}/g)?.map(byte => parseInt(byte, 16)) || []
    );
    
    // Extract salt (first 16 bytes) and hash (remaining bytes)
    const salt = hashBytes.slice(0, 16);
    const storedDerivedBits = hashBytes.slice(16);
    
    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordData,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    
    // Derive key using same parameters
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      256
    );
    
    // Compare the derived bits with stored hash
    const newDerivedBits = new Uint8Array(derivedBits);
    
    if (newDerivedBits.length !== storedDerivedBits.length) {
      return false;
    }
    
    // Constant-time comparison
    let match = 0;
    for (let i = 0; i < newDerivedBits.length; i++) {
      match |= newDerivedBits[i] ^ storedDerivedBits[i];
    }
    
    return match === 0;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}
