import { ReactNode } from 'react';

export type UserRole =
  | 'SUPER_ADMIN'
  | 'RESTAURANT_OWNER'
  | 'MANAGER'
  | 'KITCHEN_STAFF'
  | 'CASHIER'
  | 'CUSTOMER';

export type BackendRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'OWNER'
  | 'STAFF'
  | 'KITCHEN'
  | 'CASHIER'
  | 'CUSTOMER';

export type InvitationRole = Exclude<BackendRole, 'SUPER_ADMIN' | 'CUSTOMER'>;
export type OwnerInvitationRole = Extract<BackendRole, 'STAFF' | 'KITCHEN'>;

export interface SessionUser {
  email: string;
  role: UserRole;
  backendRole: BackendRole;
  name: string;
  restaurantId?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: SessionUser;
  role?: BackendRole;
  restaurantId?: number | null;
}

export interface InvitationRequest {
  email: string;
  role: InvitationRole;
  restaurantId: number;
}

export interface SuperAdminUser {
  id: number;
  name: string;
  email: string;
  role: BackendRole;
  restaurantId?: number | null;
  restaurantName?: string | null;
  enabled: boolean;
}

export interface UsersByRestaurantGroup {
  restaurantId?: number | null;
  restaurantName: string;
  owners: SuperAdminUser[];
  staff: SuperAdminUser[];
  kitchen: SuperAdminUser[];
  superAdmins: SuperAdminUser[];
  unassigned: SuperAdminUser[];
}

export interface SuperAdminUserRequest {
  name: string;
  email: string;
  role: Extract<BackendRole, 'OWNER' | 'STAFF' | 'KITCHEN'>;
  restaurantId: number | null;
  enabled: boolean;
  password?: string;
}

export interface InvitationVerifyResponse {
  email: string;
  role: BackendRole;
  valid: boolean;
}

export interface AcceptInvitationRequest {
  token: string;
  name: string;
  password: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Restaurant {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  logoUrl?: string;
  description: string;
  openingHours: string;
  serviceChargePercentage: number;
  taxPercentage: number;
  currency: string;
  themeColor: string;
  status?: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  activeOrderCount?: number;
  todayRevenue?: number;
  planName?: string;
  createdAt?: string;
}

export interface RestaurantFormValues {
  name: string;
  address: string;
  phone: string;
  email: string;
  logoUrl: string;
  description: string;
  openingHours: string;
  serviceChargePercentage: number;
  taxPercentage: number;
  currency: string;
  themeColor: string;
}

export interface Category {
  id: number;
  name: string;
  restaurantId: number;
  imageUrl?: string;
  visible?: boolean;
  menuItemCount?: number;
}

export interface CategoryFormValues {
  name: string;
  restaurantId: number;
  imageUrl?: string;
  visible?: boolean;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  status: 'AVAILABLE' | 'OUT_OF_STOCK' | 'HIDDEN';
  featured: boolean;
  featuredLabel?: 'TODAY_SPECIAL' | 'CHEF_RECOMMENDED' | 'BEST_SELLER' | null;
  preparationTime: number;
  imageUrl?: string;
  ingredients: string[];
  allergens: string[];
  categoryId: number;
  restaurantId: number;
  restaurantName?: string;
}

export interface MenuItemFormValues {
  name: string;
  description: string;
  price: number;
  status: 'AVAILABLE' | 'OUT_OF_STOCK' | 'HIDDEN';
  featured: boolean;
  featuredLabel?: 'TODAY_SPECIAL' | 'CHEF_RECOMMENDED' | 'BEST_SELLER' | null;
  preparationTime: number;
  categoryId: number;
  restaurantId: number;
  imageUrl?: string;
  ingredients: string[];
  allergens: string[];
}

export interface RestaurantTable {
  id: number;
  restaurantId?: number | null;
  tableNumber: string;
  qrCodeUrl: string;
  qrImageUrl?: string;
  active?: boolean;
}

export interface TableFormValues {
  tableNumber: string;
  restaurantId: number;
}

export interface OrderItem {
  id: number;
  menuItemId: number;
  itemName: string;
  quantity: number;
  price: number;
  subTotal: number;
}

export type OrderStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Order {
  id: number;
  tenantId?: number;
  restaurantId?: number;
  tableNumber: string;
  status: OrderStatus;
  totalAmount: number;
  orderTime: string;
  items: OrderItem[];
}

export interface CreateOrderPayload {
  restaurantId: number;
  tableNumber: string;
  items: Array<{
    menuItemId: number;
    quantity: number;
  }>;
}

export interface InviteUserPayload {
  name: string;
  email: string;
  role: UserRole;
  restaurantId?: number;
}

export interface Invitation {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  restaurantName?: string;
  status: 'PENDING' | 'ACCEPTED' | 'CANCELLED';
  invitationLink: string;
  createdAt: string;
}

export interface StaffMember {
  id: number;
  name: string;
  email: string;
  role: OwnerInvitationRole;
  enabled: boolean;
  restaurantId?: number | null;
  restaurantName?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingCycle: 'MONTHLY' | 'YEARLY';
  features: string[];
  active: boolean;
}

export interface Subscription {
  id: string;
  restaurantName: string;
  planName: string;
  status: 'ACTIVE' | 'TRIAL' | 'EXPIRED';
  renewalDate: string;
}

export interface DashboardMetric {
  label: string;
  value: string | number;
  helper: string;
  tone?: 'emerald' | 'blue' | 'amber' | 'rose';
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
}

export interface ReportPoint {
  label: string;
  value: number;
}

export interface OwnerMetricPeriodValue {
  today: number;
  week: number;
  month: number;
}

export interface OwnerItemSales {
  menuItemId: number;
  itemName: string;
  quantity: number;
  revenue: number;
}

export interface OwnerPeakHour {
  hour: number;
  orderCount: number;
}

export interface OwnerAnalytics {
  revenue: OwnerMetricPeriodValue;
  orders: OwnerMetricPeriodValue;
  topSellingItems: OwnerItemSales[];
  leastSellingItems: OwnerItemSales[];
  peakOrderingHours: OwnerPeakHour[];
  averageOrderValue: number;
}

export interface AppNotification {
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
  description: string;
}

export interface CartLine {
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
}
