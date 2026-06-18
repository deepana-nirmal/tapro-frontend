import {
  BarChart3,
  BellRing,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LucideIcon,
  MenuSquare,
  QrCode,
  Settings,
  Store,
  Users,
} from 'lucide-react';
import { NavItem, SessionUser, UserRole } from '../types';

const icon = (Icon: LucideIcon) => <Icon className="h-4 w-4" />;

export const navigationByRole: Record<UserRole, NavItem[]> = {
  SUPER_ADMIN: [
    { label: 'Overview', path: '/super-admin', icon: icon(LayoutDashboard), description: 'Platform dashboard' },
    { label: 'Restaurants', path: '/super-admin/restaurants', icon: icon(Store), description: 'Manage tenants' },
    { label: 'Users', path: '/super-admin/users', icon: icon(Users), description: 'Manage platform users' },
    { label: 'Invitations', path: '/super-admin/invitations', icon: icon(Users), description: 'Invite owners' },
    { label: 'Subscriptions', path: '/super-admin/subscriptions', icon: icon(CreditCard), description: 'Plans and billing' },
    { label: 'Reports', path: '/super-admin/reports', icon: icon(BarChart3), description: 'Revenue and growth' },
    { label: 'Settings', path: '/super-admin/settings', icon: icon(Settings), description: 'Platform controls' },
  ],
  RESTAURANT_OWNER: [
    { label: 'Overview', path: '/owner', icon: icon(LayoutDashboard), description: 'Restaurant health' },
    { label: 'Profile', path: '/owner/profile', icon: icon(Store), description: 'Brand and hours' },
    { label: 'Staff', path: '/owner/staff', icon: icon(Users), description: 'Invite and disable staff' },
    { label: 'Tables', path: '/owner/tables', icon: icon(QrCode), description: 'QR and seating' },
    { label: 'Categories', path: '/owner/categories', icon: icon(MenuSquare), description: 'Menu categories' },
    { label: 'Menu Items', path: '/owner/menu', icon: icon(ClipboardList), description: 'Dishes and availability' },
    { label: 'Orders', path: '/owner/orders', icon: icon(BellRing), description: 'Order operations' },
    { label: 'Reports', path: '/owner/reports', icon: icon(BarChart3), description: 'Sales and best sellers' },
  ],
  MANAGER: [
    { label: 'Overview', path: '/manager', icon: icon(LayoutDashboard), description: 'Shift control' },
    { label: 'Menu', path: '/manager/menu', icon: icon(MenuSquare), description: 'Categories and items' },
    { label: 'Orders', path: '/manager/orders', icon: icon(BellRing), description: 'Assign and update' },
    { label: 'Tables', path: '/manager/tables', icon: icon(QrCode), description: 'Manage tables' },
  ],
  KITCHEN_STAFF: [
    { label: 'Kitchen Board', path: '/kitchen', icon: icon(BellRing), description: 'Prep queue' },
  ],
  CASHIER: [
    { label: 'Overview', path: '/cashier', icon: icon(LayoutDashboard), description: 'Payment queue' },
    { label: 'Billing', path: '/cashier/billing', icon: icon(CreditCard), description: 'Generate bills' },
    { label: 'Payments', path: '/cashier/payments', icon: icon(ClipboardList), description: 'Mark paid and close' },
  ],
  CUSTOMER: [
    { label: 'Account', path: '/account', icon: icon(LayoutDashboard), description: 'Customer home' },
    { label: 'Orders', path: '/account/orders', icon: icon(ClipboardList), description: 'Order history' },
    { label: 'Profile', path: '/account/profile', icon: icon(Settings), description: 'Profile settings' },
  ],
};

export const getNavigationForUser = (user: SessionUser): NavItem[] => {
  if (user.backendRole === 'SUPER_ADMIN') {
    return navigationByRole.SUPER_ADMIN.map((item) =>
      item.path === '/super-admin/invitations'
        ? { ...item, path: '/admin/invitations', description: 'Role-based onboarding' }
        : item
    );
  }

  if (user.backendRole === 'ADMIN') {
    return [
      { label: 'Dashboard', path: '/admin/dashboard', icon: icon(LayoutDashboard), description: 'Administrative overview' },
      { label: 'Invitations', path: '/admin/invitations', icon: icon(Users), description: 'Invite owners and staff' },
    ];
  }

  return navigationByRole[user.role];
};
