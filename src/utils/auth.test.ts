import { buildSessionUser, defaultPathByRole, normalizeRole } from './auth';

describe('auth helpers', () => {
  it('maps SUPER_ADMIN to the Super Admin landing route', () => {
    expect(defaultPathByRole.SUPER_ADMIN).toBe('/super-admin');
    expect(normalizeRole('SUPER_ADMIN')).toBe('SUPER_ADMIN');
  });

  it('rebuilds a stored Super Admin session from the JWT role claim', () => {
    const payload = btoa(JSON.stringify({
      sub: 'admin@tapro.com',
      role: 'SUPER_ADMIN',
      exp: Math.floor(Date.now() / 1000) + 3600,
    }));
    const token = `header.${payload}.signature`;

    const user = buildSessionUser(token, 'stale@tapro.com', 'OWNER', 42);

    expect(user.email).toBe('admin@tapro.com');
    expect(user.role).toBe('SUPER_ADMIN');
    expect(user.backendRole).toBe('SUPER_ADMIN');
    expect(user.restaurantId).toBeUndefined();
  });
});
