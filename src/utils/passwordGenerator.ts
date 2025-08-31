/**
 * Generate a secure random password
 * @param length - Length of the password (default: 12)
 * @returns A secure random password
 */
export function generateSecurePassword(length: number = 12): string {
  const charset = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  };

  // Ensure at least one character from each category
  let password = '';
  password += charset.lowercase[Math.floor(Math.random() * charset.lowercase.length)];
  password += charset.uppercase[Math.floor(Math.random() * charset.uppercase.length)];
  password += charset.numbers[Math.floor(Math.random() * charset.numbers.length)];
  password += charset.symbols[Math.floor(Math.random() * charset.symbols.length)];

  // Fill the rest with random characters from all categories
  const allChars = charset.lowercase + charset.uppercase + charset.numbers + charset.symbols;
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password to make it more random
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Generate a memorable password (easier to remember)
 * @returns A memorable password
 */
export function generateMemorablePassword(): string {
  const adjectives = [
    'happy', 'bright', 'clever', 'brave', 'calm', 'eager', 'gentle', 'kind',
    'lively', 'mighty', 'noble', 'quick', 'strong', 'wise', 'young', 'zealous'
  ];
  
  const nouns = [
    'dragon', 'eagle', 'forest', 'mountain', 'ocean', 'river', 'star', 'sun',
    'tiger', 'wolf', 'castle', 'garden', 'island', 'kingdom', 'palace', 'temple'
  ];
  
  const numbers = Math.floor(Math.random() * 900) + 100; // 100-999
  const symbol = '!@#$%^&*'[Math.floor(Math.random() * 8)];
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  
  return `${adjective}${noun}${numbers}${symbol}`;
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Object with strength score and feedback
 */
export function validatePasswordStrength(password: string): {
  score: number;
  feedback: string[];
  isStrong: boolean;
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 1;
  else feedback.push('Password should be at least 8 characters long');

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Password should contain at least one lowercase letter');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Password should contain at least one uppercase letter');

  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('Password should contain at least one number');

  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  else feedback.push('Password should contain at least one special character');

  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  const isStrong = score >= 4;

  if (score < 3) {
    feedback.push('Password is weak - consider using a stronger password');
  } else if (score < 5) {
    feedback.push('Password is moderate - consider adding more complexity');
  } else {
    feedback.push('Password is strong!');
  }

  return {
    score,
    feedback,
    isStrong
  };
}
