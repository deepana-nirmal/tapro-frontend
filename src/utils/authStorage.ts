import { SessionUser } from '../types';

const TOKEN_KEY = 'tapro_token';
const USER_KEY = 'tapro_user';
const REMEMBER_EMAIL_KEY = 'tapro_remembered_email';
const AUTH_STORAGE_KEYS = [
  TOKEN_KEY,
  USER_KEY,
  'tapro_role',
  'tapro_backend_role',
  'tapro_restaurant_id',
  'tapro_auth',
  'tapro_session',
];

type StoredSession = {
  token: string | null;
  user: SessionUser | null;
  storage: 'local' | 'session' | null;
};

const readUser = (storage: Storage): SessionUser | null => {
  const userJson = storage.getItem(USER_KEY);
  if (!userJson) return null;
  try {
    return JSON.parse(userJson) as SessionUser;
  } catch {
    storage.removeItem(USER_KEY);
    return null;
  }
};

export const getStoredSession = (): StoredSession => {
  const localToken = localStorage.getItem(TOKEN_KEY);
  if (localToken) {
    return { token: localToken, user: readUser(localStorage), storage: 'local' };
  }

  const sessionToken = sessionStorage.getItem(TOKEN_KEY);
  if (sessionToken) {
    return { token: sessionToken, user: readUser(sessionStorage), storage: 'session' };
  }

  return { token: null, user: null, storage: null };
};

export const persistSession = (token: string, user: SessionUser, rememberMe = true) => {
  const target = rememberMe ? localStorage : sessionStorage;
  const other = rememberMe ? sessionStorage : localStorage;

  other.removeItem(TOKEN_KEY);
  other.removeItem(USER_KEY);
  target.setItem(TOKEN_KEY, token);
  target.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuthSession = () => {
  AUTH_STORAGE_KEYS.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

export const rememberEmail = (email: string) => {
  localStorage.setItem(REMEMBER_EMAIL_KEY, email);
};

export const clearRememberedEmail = () => {
  localStorage.removeItem(REMEMBER_EMAIL_KEY);
};

export const getRememberedEmail = () => localStorage.getItem(REMEMBER_EMAIL_KEY) || '';
