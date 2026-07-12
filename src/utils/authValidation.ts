const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_MIN_LENGTH = 6;
export const PASSWORD_MAX_LENGTH = 128;

export const validateEmail = (value: string) => {
  const email = value.trim();
  if (!email) return 'Email is required.';
  if (email.length > 254) return 'Email must be 254 characters or fewer.';
  if (!emailPattern.test(email)) return 'Enter a valid email address.';
  return '';
};

export const validatePassword = (value: string, label = 'Password') => {
  if (!value) return `${label} is required.`;
  if (value.length < PASSWORD_MIN_LENGTH) return `${label} must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  if (value.length > PASSWORD_MAX_LENGTH) return `${label} must be ${PASSWORD_MAX_LENGTH} characters or fewer.`;
  return '';
};

export const validateConfirmPassword = (password: string, confirmPassword: string) => {
  const required = validatePassword(confirmPassword, 'Confirm password');
  if (required) return required;
  if (password !== confirmPassword) return 'Passwords do not match.';
  return '';
};

export const validateName = (value: string) => {
  const name = value.trim();
  if (!name) return 'Name is required.';
  if (name.length < 2) return 'Name must be at least 2 characters.';
  if (name.length > 80) return 'Name must be 80 characters or fewer.';
  return '';
};

export const validateRequiredToken = (value: string, label = 'Token') => {
  if (!value.trim()) return `${label} is missing.`;
  if (value.length > 500) return `${label} is too long.`;
  return '';
};

export const focusFirstError = (errors: Record<string, string>) => {
  const first = Object.entries(errors).find(([, message]) => Boolean(message));
  if (!first) return;
  document.querySelector<HTMLElement>(`[name="${first[0]}"]`)?.focus();
};
