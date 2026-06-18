import { BackendRole, SessionUser, UserRole } from '../types';

const roleMap: Record<BackendRole, UserRole> = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  OWNER: 'RESTAURANT_OWNER',
  ADMIN: 'MANAGER',
  STAFF: 'MANAGER',
  KITCHEN: 'KITCHEN_STAFF',
  CASHIER: 'CASHIER',
  CUSTOMER: 'CUSTOMER',
};

const backendRoleMap: Record<UserRole, BackendRole> = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  RESTAURANT_OWNER: 'OWNER',
  MANAGER: 'ADMIN',
  KITCHEN_STAFF: 'KITCHEN',
  CASHIER: 'CASHIER',
  CUSTOMER: 'CUSTOMER',
};

export const normalizeRole = (role: string): UserRole => {
  return roleMap[(role || 'CUSTOMER').toUpperCase() as BackendRole] || 'CUSTOMER';
};

export const toBackendRole = (role: UserRole): BackendRole => backendRoleMap[role];

const decodePart = <T>(part: string): T | null => {
  try {
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
};

interface JwtPayload {
  sub: string;
  exp?: number;
  role?: string;
}

export const decodeToken = (token: string): JwtPayload | null => {
  const segments = token.split('.');
  return segments.length === 3 ? decodePart<JwtPayload>(segments[1]) : null;
};

export const buildSessionUser = (
  token: string,
  fallbackEmail?: string,
  backendRole?: string,
  restaurantId?: number | null
): SessionUser => {
  const payload = decodeToken(token);
  const email = payload?.sub || fallbackEmail || 'user@tapro.app';
  const rawRole = payload?.role || backendRole || 'CUSTOMER';
  const role = normalizeRole(rawRole);

  return {
    email,
    role,
    backendRole: (rawRole.toUpperCase() as BackendRole) || 'CUSTOMER',
    name: email.split('@')[0].replace(/[._-]/g, ' '),
    restaurantId: role === 'SUPER_ADMIN' ? undefined : restaurantId ?? undefined,
  };
};

export const isTokenExpired = (token: string): boolean => {
  const payload = decodeToken(token);
  if (!payload?.exp) {
    return false;
  }

  return payload.exp * 1000 <= Date.now();
};

export const defaultPathByRole: Record<UserRole, string> = {
  SUPER_ADMIN: '/super-admin',
  RESTAURANT_OWNER: '/owner',
  MANAGER: '/manager',
  KITCHEN_STAFF: '/kitchen',
  CASHIER: '/cashier',
  CUSTOMER: '/account',
};

export const invitationPathByBackendRole: Record<BackendRole, string> = {
  SUPER_ADMIN: '/super-admin',
  ADMIN: '/admin/dashboard',
  OWNER: '/owner/dashboard',
  STAFF: '/staff/dashboard',
  KITCHEN: '/kitchen/dashboard',
  CASHIER: '/staff/dashboard',
  CUSTOMER: '/account',
};
