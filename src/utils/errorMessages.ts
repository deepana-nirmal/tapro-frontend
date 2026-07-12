import { AxiosError } from 'axios';

type ErrorPayload = {
  message?: string;
  error?: string;
  errors?: Record<string, string | string[]>;
};

const safeMessages: Array<[RegExp, string]> = [
  [/bad credentials|invalid credentials|invalid email|invalid password/i, 'The email or password you entered is incorrect.'],
  [/disabled|inactive|not active/i, 'Your account is not currently active. Contact your restaurant administrator.'],
  [/suspended/i, 'This restaurant account is not currently active. Contact the platform administrator.'],
  [/expired.*invitation|invitation expired/i, 'This invitation has expired. Request a new invitation.'],
  [/invalid.*invitation|invitation not found/i, 'This invitation link is invalid or has expired.'],
  [/already registered|already exists|duplicate/i, 'An account with this email already exists.'],
  [/expired.*token|invalid.*token|token/i, 'This link is invalid or has expired. Request a new link.'],
  [/password must|password policy|weak password/i, 'The password does not meet the required policy.'],
  [/rate limit|too many/i, 'Too many attempts. Please wait and try again.'],
];

export const normalizeAuthError = (error: unknown, fallback = 'We could not complete the request. Please try again.') => {
  const axiosError = error as AxiosError<ErrorPayload>;

  if (axiosError.code === 'ECONNABORTED') {
    return 'The request timed out. Check your connection and try again.';
  }

  if (!axiosError.response) {
    return 'We could not connect to Tapro. Check your connection and try again.';
  }

  if (axiosError.response.status >= 500) {
    return 'Tapro is temporarily unavailable. Please try again shortly.';
  }

  const payload = axiosError.response.data;
  const raw = typeof payload === 'string' ? payload : payload?.message || payload?.error || '';
  const mapped = safeMessages.find(([pattern]) => pattern.test(raw));
  if (mapped) return mapped[1];

  if (axiosError.response.status === 400 && payload?.errors) {
    const first = Object.values(payload.errors)[0];
    return Array.isArray(first) ? first[0] : first || fallback;
  }

  return raw && raw.length < 160 && !/[{};]/.test(raw) ? raw : fallback;
};
