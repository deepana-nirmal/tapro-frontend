import { validateConfirmPassword, validateEmail, validateName, validatePassword, validateRequiredToken } from './authValidation';

describe('auth validation', () => {
  it('validates required and malformed email values', () => {
    expect(validateEmail('')).toBe('Email is required.');
    expect(validateEmail('not-an-email')).toBe('Enter a valid email address.');
    expect(validateEmail(' user@example.com ')).toBe('');
  });

  it('validates password length without truncating values', () => {
    expect(validatePassword('')).toBe('Password is required.');
    expect(validatePassword('12345')).toBe('Password must be at least 6 characters.');
    expect(validatePassword('123456')).toBe('');
  });

  it('validates matching confirmation passwords', () => {
    expect(validateConfirmPassword('123456', '')).toBe('Confirm password is required.');
    expect(validateConfirmPassword('123456', 'abcdef')).toBe('Passwords do not match.');
    expect(validateConfirmPassword('123456', '123456')).toBe('');
  });

  it('validates names and tokens', () => {
    expect(validateName(' ')).toBe('Name is required.');
    expect(validateName('A')).toBe('Name must be at least 2 characters.');
    expect(validateName('Ana')).toBe('');
    expect(validateRequiredToken('', 'Reset token')).toBe('Reset token is missing.');
  });
});
