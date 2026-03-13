/**
 * Tests for auth-related validation logic used in signup/onboarding.
 */

// Username validation: mirrors constraints from the DB schema (unique, not null)
// and UI validation in SignupScreen / OnboardingScreen
function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{3,30}$/.test(username);
}

// Display name: optional but if provided must be non-empty after trim
function isValidDisplayName(name: string): boolean {
  return name.trim().length > 0 && name.trim().length <= 50;
}

describe('username validation', () => {
  it('accepts alphanumeric usernames', () => {
    expect(isValidUsername('john123')).toBe(true);
  });

  it('accepts usernames with underscores', () => {
    expect(isValidUsername('john_doe')).toBe(true);
  });

  it('rejects usernames shorter than 3 chars', () => {
    expect(isValidUsername('ab')).toBe(false);
  });

  it('rejects usernames longer than 30 chars', () => {
    expect(isValidUsername('a'.repeat(31))).toBe(false);
  });

  it('rejects usernames with spaces', () => {
    expect(isValidUsername('john doe')).toBe(false);
  });

  it('rejects usernames with special characters', () => {
    expect(isValidUsername('john@doe')).toBe(false);
  });

  it('accepts exactly 3 chars', () => {
    expect(isValidUsername('abc')).toBe(true);
  });

  it('accepts exactly 30 chars', () => {
    expect(isValidUsername('a'.repeat(30))).toBe(true);
  });
});

describe('display name validation', () => {
  it('accepts normal names', () => {
    expect(isValidDisplayName('John Doe')).toBe(true);
  });

  it('rejects empty string', () => {
    expect(isValidDisplayName('')).toBe(false);
  });

  it('rejects whitespace-only string', () => {
    expect(isValidDisplayName('   ')).toBe(false);
  });

  it('rejects names over 50 chars', () => {
    expect(isValidDisplayName('a'.repeat(51))).toBe(false);
  });

  it('accepts names with spaces and accents', () => {
    expect(isValidDisplayName('María José')).toBe(true);
  });
});
