import { clearAuthSession, clearRememberedEmail, getRememberedEmail, getStoredSession, persistSession, rememberEmail } from './authStorage';
import { SessionUser } from '../types';

const user: SessionUser = {
  email: 'guest@example.com',
  name: 'Guest',
  role: 'CUSTOMER',
  backendRole: 'CUSTOMER',
};

describe('auth storage', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('persists remembered sessions in localStorage', () => {
    persistSession('token.local', user, true);

    expect(localStorage.getItem('tapro_token')).toBe('token.local');
    expect(sessionStorage.getItem('tapro_token')).toBeNull();
    expect(getStoredSession().storage).toBe('local');
  });

  it('persists non-remembered sessions in sessionStorage', () => {
    persistSession('token.session', user, false);

    expect(sessionStorage.getItem('tapro_token')).toBe('token.session');
    expect(localStorage.getItem('tapro_token')).toBeNull();
    expect(getStoredSession().storage).toBe('session');
  });

  it('clears auth tokens from both storage scopes without clearing remembered email unless requested', () => {
    persistSession('token.local', user, true);
    persistSession('token.session', user, false);
    localStorage.setItem('tapro_role', 'OWNER');
    sessionStorage.setItem('tapro_restaurant_id', '1');
    rememberEmail(user.email);

    clearAuthSession();
    expect(getStoredSession().token).toBeNull();
    expect(localStorage.getItem('tapro_role')).toBeNull();
    expect(sessionStorage.getItem('tapro_restaurant_id')).toBeNull();
    expect(getRememberedEmail()).toBe(user.email);

    clearRememberedEmail();
    expect(getRememberedEmail()).toBe('');
  });
});
