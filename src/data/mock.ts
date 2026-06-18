import {
  ActivityItem,
  Category,
  Invitation,
  MenuItem,
  Order,
  ReportPoint,
  Restaurant,
  RestaurantTable,
  StaffMember,
  Subscription,
  SubscriptionPlan,
} from '../types';

export const mockRestaurants: Restaurant[] = [
  { id: 1, name: 'Harbor Table', address: '120 Ocean Ave', phone: '+1 555 410 9001', email: 'hello@harbortable.com', logoUrl: '', description: 'Coastal dining and QR ordering.', openingHours: 'Mon-Sun: 11:00 - 23:00', serviceChargePercentage: 10, taxPercentage: 8, currency: 'USD', themeColor: '#10b981', status: 'ACTIVE', planName: 'Growth', createdAt: '2026-06-01T09:00:00Z' },
  { id: 2, name: 'Cedar Spoon', address: '44 Market Street', phone: '+1 555 410 9002', email: 'ops@cedarspoon.com', logoUrl: '', description: 'Seasonal menu and neighborhood hospitality.', openingHours: 'Tue-Sun: 12:00 - 22:00', serviceChargePercentage: 12, taxPercentage: 8, currency: 'USD', themeColor: '#f59e0b', status: 'ACTIVE', planName: 'Scale', createdAt: '2026-05-12T09:00:00Z' },
  { id: 3, name: 'Saffron Yard', address: '88 Highline Blvd', phone: '+1 555 410 9003', email: 'owner@saffronyard.com', logoUrl: '', description: 'Modern South Asian dining.', openingHours: 'Mon-Sat: 17:00 - 23:30', serviceChargePercentage: 10, taxPercentage: 7.5, currency: 'USD', themeColor: '#ef4444', status: 'SUSPENDED', planName: 'Starter', createdAt: '2026-04-09T09:00:00Z' },
];

export const mockCategories: Category[] = [
  { id: 1, name: 'Starters', restaurantId: 1 },
  { id: 2, name: 'Mains', restaurantId: 1 },
  { id: 3, name: 'Desserts', restaurantId: 1 },
];

export const mockMenuItems: MenuItem[] = [
  { id: 1, name: 'Seared Salmon Bowl', description: 'Brown rice, citrus greens, sesame dressing', price: 18, status: 'AVAILABLE', featured: true, featuredLabel: 'CHEF_RECOMMENDED', preparationTime: 18, imageUrl: '', ingredients: ['Salmon', 'Brown rice', 'Citrus greens'], allergens: ['Fish', 'Sesame'], categoryId: 2, restaurantId: 1, restaurantName: 'Harbor Table' },
  { id: 2, name: 'Truffle Fries', description: 'Parmesan, rosemary salt', price: 9, status: 'AVAILABLE', featured: false, featuredLabel: null, preparationTime: 10, imageUrl: '', ingredients: ['Potato', 'Parmesan', 'Truffle oil'], allergens: ['Dairy'], categoryId: 1, restaurantId: 1, restaurantName: 'Harbor Table' },
  { id: 3, name: 'Chocolate Basque Cheesecake', description: 'Burnt top, vanilla cream', price: 11, status: 'OUT_OF_STOCK', featured: false, featuredLabel: null, preparationTime: 5, imageUrl: '', ingredients: ['Cream cheese', 'Chocolate', 'Eggs'], allergens: ['Dairy', 'Egg'], categoryId: 3, restaurantId: 1, restaurantName: 'Harbor Table' },
];

export const mockTables: RestaurantTable[] = [
  { id: 1, restaurantId: 1, tableNumber: 'A1', qrCodeUrl: '/menu/1/table/1', qrImageUrl: '/api/qr/tables/1', active: true },
  { id: 2, restaurantId: 1, tableNumber: 'A2', qrCodeUrl: '/menu/1/table/2', qrImageUrl: '/api/qr/tables/2', active: true },
  { id: 3, restaurantId: 1, tableNumber: 'P1', qrCodeUrl: '/menu/1/table/3', qrImageUrl: '/api/qr/tables/3', active: true },
];

export const mockOrders: Order[] = [
  {
    id: 1001,
    tenantId: 1,
    tableNumber: 'A1',
    status: 'PENDING',
    totalAmount: 36,
    orderTime: '2026-06-15T08:45:00Z',
    items: [
      { id: 1, menuItemId: 1, itemName: 'Seared Salmon Bowl', quantity: 1, price: 18, subTotal: 18 },
      { id: 2, menuItemId: 2, itemName: 'Truffle Fries', quantity: 2, price: 9, subTotal: 18 },
    ],
  },
  {
    id: 1002,
    tenantId: 1,
    tableNumber: 'A2',
    status: 'PREPARING',
    totalAmount: 27,
    orderTime: '2026-06-15T09:10:00Z',
    items: [{ id: 3, menuItemId: 1, itemName: 'Seared Salmon Bowl', quantity: 1, price: 18, subTotal: 18 }],
  },
  {
    id: 1003,
    tenantId: 2,
    tableNumber: 'P1',
    status: 'READY',
    totalAmount: 54,
    orderTime: '2026-06-15T09:30:00Z',
    items: [{ id: 4, menuItemId: 2, itemName: 'Truffle Fries', quantity: 6, price: 9, subTotal: 54 }],
  },
];

export const mockActivities: ActivityItem[] = [
  { id: '1', title: 'Restaurant activated', description: 'Harbor Table switched to the Growth plan.', timestamp: '2026-06-15T07:00:00Z' },
  { id: '2', title: 'Owner invited', description: 'A new owner invitation was sent to ops@cedarspoon.com.', timestamp: '2026-06-15T06:10:00Z' },
  { id: '3', title: 'Orders spike', description: 'Lunch volume is 18% above the weekly baseline.', timestamp: '2026-06-15T05:40:00Z' },
];

export const mockInvitations: Invitation[] = [
  {
    id: 'inv-1',
    name: 'Lena Ortiz',
    email: 'lena@cedarspoon.com',
    role: 'RESTAURANT_OWNER',
    restaurantName: 'Cedar Spoon',
    status: 'PENDING',
    invitationLink: 'https://tapro.app/invite/accept?token=inv-1',
    createdAt: '2026-06-14T10:00:00Z',
  },
];

export const mockStaffMembers: StaffMember[] = [
  { id: 11, name: 'Mia Carter', email: 'mia@harbortable.com', role: 'STAFF', enabled: true, restaurantId: 1, restaurantName: 'Harbor Table' },
  { id: 12, name: 'Noah Bennett', email: 'noah@harbortable.com', role: 'KITCHEN', enabled: false, restaurantId: 1, restaurantName: 'Harbor Table' },
];

export const mockPlans: SubscriptionPlan[] = [
  { id: 'starter', name: 'Starter', price: 49, billingCycle: 'MONTHLY', active: true, features: ['1 restaurant', 'QR ordering', 'Basic analytics'] },
  { id: 'growth', name: 'Growth', price: 129, billingCycle: 'MONTHLY', active: true, features: ['5 restaurants', 'Staff roles', 'Priority support'] },
  { id: 'scale', name: 'Scale', price: 299, billingCycle: 'YEARLY', active: true, features: ['Unlimited restaurants', 'Advanced reports', 'Custom onboarding'] },
];

export const mockSubscriptions: Subscription[] = [
  { id: 'sub-1', restaurantName: 'Harbor Table', planName: 'Growth', status: 'ACTIVE', renewalDate: '2026-07-01' },
  { id: 'sub-2', restaurantName: 'Cedar Spoon', planName: 'Scale', status: 'TRIAL', renewalDate: '2026-06-28' },
];

export const mockReportSeries: ReportPoint[] = [
  { label: 'Jan', value: 12000 },
  { label: 'Feb', value: 15800 },
  { label: 'Mar', value: 18200 },
  { label: 'Apr', value: 21900 },
  { label: 'May', value: 24100 },
  { label: 'Jun', value: 26800 },
];
