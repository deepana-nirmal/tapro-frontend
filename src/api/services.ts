import { AxiosResponse } from 'axios';
import { apiClient, publicApiClient } from './client';
import {
  AcceptInvitationRequest,
  ActivityItem,
  ApiEnvelope,
  AuthResponse,
  Category,
  CategoryFormValues,
  CreateOrderPayload,
  DashboardMetric,
  BackendRole,
  Invitation,
  InvitationRequest,
  InvitationRole,
  InvitationVerifyResponse,
  InviteUserPayload,
  LoginCredentials,
  MenuItem,
  MenuItemFormValues,
  Order,
  OrderStatus,
  OwnerAnalytics,
  ReportPoint,
  Restaurant,
  RestaurantFormValues,
  RestaurantTable,
  SessionUser,
  StaffMember,
  SuperAdminUser,
  SuperAdminUserRequest,
  Subscription,
  SubscriptionPlan,
  TableFormValues,
  UserRole,
  UsersByRestaurantGroup,
} from '../types';
import {
  mockActivities,
  mockPlans,
  mockReportSeries,
  mockRestaurants,
  mockStaffMembers,
  mockSubscriptions,
} from '../data/mock';
import { buildSessionUser, normalizeRole, toBackendRole } from '../utils/auth';

const demoMode = process.env.REACT_APP_DEMO_MODE === 'true';
const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const backendOrigin = (() => {
  try {
    return new URL(apiBaseUrl).origin;
  } catch {
    return window.location.origin;
  }
})();

const unwrap = <T>(payload: ApiEnvelope<T> | T): T => {
  if (payload && typeof payload === 'object' && 'data' in (payload as ApiEnvelope<T>)) {
    return (payload as ApiEnvelope<T>).data;
  }

  return payload as T;
};

const withFallback = async <T>(
  request: Promise<AxiosResponse<ApiEnvelope<T> | T>>,
  fallback: T
): Promise<T> => {
  try {
    const response = await request;
    return unwrap(response.data);
  } catch (error) {
    if (demoMode) {
      return fallback;
    }

    throw error;
  }
};

const resolveBackendUrl = (value?: string | null) => {
  if (!value) {
    return value || '';
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `${backendOrigin}${value.startsWith('/') ? value : `/${value}`}`;
};

const resolveFrontendUrl = (value?: string | null) => {
  if (!value) {
    return value || '';
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `${window.location.origin}${value.startsWith('/') ? value : `/${value}`}`;
};

const normalizeMenuItem = (item: MenuItem): MenuItem => ({
  ...item,
  imageUrl: item.imageUrl ? resolveBackendUrl(item.imageUrl) : item.imageUrl,
});

const normalizeTable = (table: RestaurantTable): RestaurantTable => ({
  ...table,
  qrCodeUrl: resolveFrontendUrl(table.qrCodeUrl),
  qrImageUrl: table.qrImageUrl ? resolveBackendUrl(table.qrImageUrl) : table.qrImageUrl,
});

const normalizeCategory = (category: Category): Category => ({
  ...category,
  imageUrl: category.imageUrl ? resolveBackendUrl(category.imageUrl) : category.imageUrl,
});

const normalizeRestaurant = (restaurant: Restaurant): Restaurant => ({
  ...restaurant,
  logoUrl: restaurant.logoUrl ? resolveBackendUrl(restaurant.logoUrl) : restaurant.logoUrl,
});

export const persistSession = (token: string, user: SessionUser) => {
  localStorage.setItem('tapro_token', token);
  localStorage.setItem('tapro_user', JSON.stringify(user));
};

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ApiEnvelope<{ token: string; role: string; restaurantId?: number | null }>>('/auth/login', credentials);
      const payload = unwrap(response.data);
      const user = buildSessionUser(payload.token, credentials.email, payload.role, payload.restaurantId);
      persistSession(payload.token, user);
      return { token: payload.token, user, role: user.backendRole, restaurantId: payload.restaurantId };
    } catch (error) {
      if (!demoMode) {
        throw error;
      }

      const backendRole = toBackendRole(credentials.email.includes('admin') ? 'SUPER_ADMIN' : credentials.email.includes('owner') ? 'RESTAURANT_OWNER' : credentials.email.includes('kitchen') ? 'KITCHEN_STAFF' : credentials.email.includes('cashier') ? 'CASHIER' : credentials.email.includes('manager') ? 'MANAGER' : 'CUSTOMER');
      const fakeToken = `demo.${btoa(JSON.stringify({ sub: credentials.email, role: backendRole, exp: Math.floor(Date.now() / 1000) + 86400 }))}.signature`;
      const user = buildSessionUser(fakeToken, credentials.email, backendRole, 1);
      persistSession(fakeToken, user);
      return { token: fakeToken, user, role: user.backendRole, restaurantId: 1 };
    }
  },

  async register(payload: { email: string; password: string; role: UserRole }) {
    return withFallback(
      apiClient.post('/auth/register', { ...payload, role: toBackendRole(payload.role) }),
      'Registered in demo mode'
    );
  },

  async forgotPassword(email: string) {
    // Connect this to a real Spring Boot password recovery endpoint when available.
    return withFallback(apiClient.post('/auth/forgot-password', { email }), 'Reset email queued in demo mode');
  },

  async resetPassword(token: string, password: string) {
    // Connect this to a real Spring Boot reset-password endpoint when available.
    return withFallback(apiClient.post('/auth/reset-password', { token, password }), 'Password updated in demo mode');
  },

  async changePassword(currentPassword: string, newPassword: string) {
    // Connect this to a real authenticated password change endpoint when available.
    return withFallback(
      apiClient.post('/auth/change-password', { currentPassword, newPassword }),
      'Password changed in demo mode'
    );
  },

  logout() {
    localStorage.removeItem('tapro_token');
    localStorage.removeItem('tapro_user');
  },
};

export const restaurantService = {
  async list() {
    const response = await apiClient.get<ApiEnvelope<Restaurant[]> | Restaurant[]>('/restaurants');
    return unwrap(response.data).map(normalizeRestaurant);
  },
  async getById(id: number) {
    const response = await apiClient.get<ApiEnvelope<Restaurant> | Restaurant>(`/restaurants/${id}`);
    return normalizeRestaurant(unwrap(response.data));
  },
  async getPublicById(id: number) {
    const response = await publicApiClient.get<ApiEnvelope<Restaurant> | Restaurant>(`/restaurants/public/${id}`);
    return normalizeRestaurant(unwrap(response.data));
  },
  async create(payload: RestaurantFormValues) {
    const response = await apiClient.post<ApiEnvelope<Restaurant> | Restaurant>('/restaurants', payload);
    return normalizeRestaurant(unwrap(response.data));
  },
  async update(id: number, payload: RestaurantFormValues) {
    const response = await apiClient.put<ApiEnvelope<Restaurant> | Restaurant>(`/restaurants/${id}`, payload);
    return normalizeRestaurant(unwrap(response.data));
  },
  async delete(id: number) {
    await apiClient.delete(`/restaurants/${id}`);
    return true;
  },
  async suspend(id: number) {
    const response = await apiClient.patch<ApiEnvelope<Restaurant> | Restaurant>(`/restaurants/${id}/suspend`);
    return normalizeRestaurant(unwrap(response.data));
  },
  async activate(id: number) {
    const response = await apiClient.patch<ApiEnvelope<Restaurant> | Restaurant>(`/restaurants/${id}/activate`);
    return normalizeRestaurant(unwrap(response.data));
  },
  async uploadLogo(id: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ApiEnvelope<Restaurant> | Restaurant>(`/restaurants/${id}/logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return normalizeRestaurant(unwrap(response.data));
  },
  async uploadOwnerLogo(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ApiEnvelope<Restaurant> | Restaurant>('/owner/restaurant/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return normalizeRestaurant(unwrap(response.data));
  },
  listAdmin() {
    return superAdminRestaurantService.list();
  },
};

export const categoryService = {
  async listByRestaurant(restaurantId: number) {
    const response = await apiClient.get<ApiEnvelope<Category[]> | Category[]>(`/categories/restaurant/${restaurantId}`);
    return unwrap(response.data).map(normalizeCategory);
  },
  async getById(id: number) {
    const response = await apiClient.get<ApiEnvelope<Category> | Category>(`/categories/${id}`);
    return normalizeCategory(unwrap(response.data));
  },
  async create(payload: CategoryFormValues) {
    const response = await apiClient.post<ApiEnvelope<Category> | Category>('/categories', payload);
    return normalizeCategory(unwrap(response.data));
  },
  async update(id: number, payload: CategoryFormValues) {
    const response = await apiClient.put<ApiEnvelope<Category> | Category>(`/categories/${id}`, payload);
    return normalizeCategory(unwrap(response.data));
  },
  async updateVisibility(id: number, visible: boolean) {
    const response = await apiClient.put<ApiEnvelope<Category> | Category>(`/categories/${id}/visibility?visible=${visible}`);
    return normalizeCategory(unwrap(response.data));
  },
  async delete(id: number) {
    await apiClient.delete(`/categories/${id}`);
    return true;
  },
  async uploadImageForOwner(categoryId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ApiEnvelope<Category> | Category>(`/owner/categories/${categoryId}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return normalizeCategory(unwrap(response.data));
  },
  async uploadImageForRestaurant(restaurantId: number, categoryId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ApiEnvelope<Category> | Category>(
      `/super-admin/restaurants/${restaurantId}/categories/${categoryId}/image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return normalizeCategory(unwrap(response.data));
  },
};

export const menuService = {
  async listByRestaurant(restaurantId: number) {
    const response = await apiClient.get<ApiEnvelope<MenuItem[]> | MenuItem[]>(`/menu-items/restaurant/${restaurantId}`);
    return unwrap(response.data).map(normalizeMenuItem);
  },
  async listByRestaurantForManagement(restaurantId: number) {
    const response = await apiClient.get<ApiEnvelope<MenuItem[]> | MenuItem[]>(`/menu-items/restaurant/${restaurantId}/manage`);
    return unwrap(response.data).map(normalizeMenuItem);
  },
  async create(payload: MenuItemFormValues) {
    const response = await apiClient.post<ApiEnvelope<MenuItem> | MenuItem>('/menu-items', payload);
    return normalizeMenuItem(unwrap(response.data));
  },
  async update(id: number, payload: MenuItemFormValues) {
    const response = await apiClient.put<ApiEnvelope<MenuItem> | MenuItem>(`/menu-items/${id}`, payload);
    return normalizeMenuItem(unwrap(response.data));
  },
  async updateStatus(id: number, status: MenuItem['status']) {
    const response = await apiClient.put<ApiEnvelope<MenuItem> | MenuItem>(`/menu-items/${id}/status?status=${status}`);
    return normalizeMenuItem(unwrap(response.data));
  },
  async updateFeatured(id: number, featured: boolean, featuredLabel?: MenuItem['featuredLabel']) {
    const response = await apiClient.put<ApiEnvelope<MenuItem> | MenuItem>(
      `/menu-items/${id}/featured?featured=${featured}${featured && featuredLabel ? `&featuredLabel=${featuredLabel}` : ''}`
    );
    return normalizeMenuItem(unwrap(response.data));
  },
  uploadImage: async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ApiEnvelope<MenuItem> | MenuItem>(`/menu-items/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return normalizeMenuItem(unwrap(response.data));
  },
  async delete(id: number) {
    await apiClient.delete(`/menu-items/${id}`);
    return true;
  },
};

export const tableService = {
  async listByRestaurant(restaurantId: number) {
    const response = await apiClient.get<ApiEnvelope<RestaurantTable[]> | RestaurantTable[]>(`/tables/restaurant/${restaurantId}`);
    return unwrap(response.data).map(normalizeTable);
  },
  async create(payload: TableFormValues) {
    const response = await apiClient.post<ApiEnvelope<RestaurantTable> | RestaurantTable>('/tables', payload);
    return normalizeTable(unwrap(response.data));
  },
  async update(id: number, payload: TableFormValues) {
    const response = await apiClient.put<ApiEnvelope<RestaurantTable> | RestaurantTable>(`/tables/${id}`, payload);
    return normalizeTable(unwrap(response.data));
  },
  async delete(id: number) {
    await apiClient.delete(`/tables/${id}`);
    return true;
  },
  async getPublicTable(restaurantId: number, tableId: number) {
    const response = await apiClient.get<ApiEnvelope<RestaurantTable> | RestaurantTable>(`/tables/public/restaurant/${restaurantId}/table/${tableId}`);
    return normalizeTable(unwrap(response.data));
  },
};

export const orderService = {
  async list() {
    const response = await apiClient.get<ApiEnvelope<Order[]> | Order[]>('/orders');
    return unwrap(response.data);
  },
  async listByStatus(status: OrderStatus) {
    const response = await apiClient.get<ApiEnvelope<Order[]> | Order[]>(`/orders/status/${status}`);
    return unwrap(response.data);
  },
  async listByTable(tableNumber: string) {
    const response = await apiClient.get<ApiEnvelope<Order[]> | Order[]>(`/orders/table/${tableNumber}`);
    return unwrap(response.data);
  },
  async create(payload: CreateOrderPayload) {
    const response = await publicApiClient.post<ApiEnvelope<Order> | Order>('/orders', payload, {
      headers: {
        'X-Tenant-ID': String(payload.restaurantId),
      },
    });
    return unwrap(response.data);
  },
  async updateStatus(id: number, status: OrderStatus) {
    const response = await apiClient.put<ApiEnvelope<Order> | Order>(`/orders/${id}/status?newStatus=${status}`);
    return unwrap(response.data);
  },
  async ownerUpdateStatus(id: number, status: OrderStatus) {
    const response = await apiClient.put<ApiEnvelope<Order> | Order>(`/owner/orders/${id}/status?status=${status}`);
    return unwrap(response.data);
  },
  async ownerOrders(restaurantId: number, status?: OrderStatus) {
    const response = await apiClient.get<Order[]>(
      status ? `/owner/orders/${restaurantId}/status?status=${status}` : `/owner/orders/${restaurantId}`
    );
    return response.data;
  },
  async ownerActiveOrders() {
    const response = await apiClient.get<ApiEnvelope<Order[]> | Order[]>('/owner/orders/active');
    return unwrap(response.data);
  },
  async ownerPastOrders(filters: { from?: string; to?: string; status?: Extract<OrderStatus, 'COMPLETED' | 'CANCELLED'>; tableNumber?: string }) {
    const params = new URLSearchParams();
    if (filters.from) {
      params.set('from', filters.from);
    }
    if (filters.to) {
      params.set('to', filters.to);
    }
    if (filters.status) {
      params.set('status', filters.status);
    }
    if (filters.tableNumber) {
      params.set('tableNumber', filters.tableNumber);
    }

    const response = await apiClient.get<ApiEnvelope<Order[]> | Order[]>(`/owner/orders/past${params.toString() ? `?${params}` : ''}`);
    return unwrap(response.data);
  },
  async kitchenOrders() {
    const response = await apiClient.get<ApiEnvelope<Order[]> | Order[]>('/kitchen/orders');
    return unwrap(response.data);
  },
  async kitchenPastOrders() {
    const response = await apiClient.get<ApiEnvelope<Order[]> | Order[]>('/kitchen/orders/past');
    return unwrap(response.data);
  },
  async kitchenUpdateStatus(id: number, status: OrderStatus) {
    const response = await apiClient.put<ApiEnvelope<Order> | Order>(`/kitchen/orders/${id}/status?status=${status}`);
    return unwrap(response.data);
  },
  async getPublicById(id: number, restaurantId?: number) {
    const url = restaurantId ? `/orders/public/${id}?restaurantId=${restaurantId}` : `/orders/public/${id}`;
    const response = await publicApiClient.get<ApiEnvelope<Order> | Order>(url);
    return unwrap(response.data);
  },
};

export const superAdminRestaurantService = {
  async list() {
    const response = await apiClient.get<ApiEnvelope<Restaurant[]> | Restaurant[]>('/super-admin/restaurants');
    return unwrap(response.data).map(normalizeRestaurant);
  },
  async getById(restaurantId: number) {
    const response = await apiClient.get<ApiEnvelope<Restaurant> | Restaurant>(`/super-admin/restaurants/${restaurantId}`);
    return normalizeRestaurant(unwrap(response.data));
  },
  async uploadLogo(restaurantId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ApiEnvelope<Restaurant> | Restaurant>(`/super-admin/restaurants/${restaurantId}/logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return normalizeRestaurant(unwrap(response.data));
  },
  async activeOrders(restaurantId: number) {
    const response = await apiClient.get<ApiEnvelope<Order[]> | Order[]>(`/super-admin/restaurants/${restaurantId}/orders/active`);
    return unwrap(response.data);
  },
  async pastOrders(
    restaurantId: number,
    filters: { from?: string; to?: string; status?: Extract<OrderStatus, 'COMPLETED' | 'CANCELLED'>; tableNumber?: string }
  ) {
    const params = new URLSearchParams();
    if (filters.from) {
      params.set('from', filters.from);
    }
    if (filters.to) {
      params.set('to', filters.to);
    }
    if (filters.status) {
      params.set('status', filters.status);
    }
    if (filters.tableNumber) {
      params.set('tableNumber', filters.tableNumber);
    }

    const response = await apiClient.get<ApiEnvelope<Order[]> | Order[]>(
      `/super-admin/restaurants/${restaurantId}/orders/past${params.toString() ? `?${params}` : ''}`
    );
    return unwrap(response.data);
  },
  async users(restaurantId: number) {
    const response = await apiClient.get<ApiEnvelope<StaffMember[]> | StaffMember[]>(`/super-admin/restaurants/${restaurantId}/users`);
    return unwrap(response.data);
  },
  async analytics(restaurantId: number) {
    const response = await apiClient.get<ApiEnvelope<OwnerAnalytics> | OwnerAnalytics>(`/super-admin/restaurants/${restaurantId}/analytics`);
    return unwrap(response.data);
  },
  async menuItems(restaurantId: number) {
    const response = await apiClient.get<ApiEnvelope<MenuItem[]> | MenuItem[]>(`/super-admin/restaurants/${restaurantId}/menu-items`);
    return unwrap(response.data).map(normalizeMenuItem);
  },
  async categories(restaurantId: number) {
    const response = await apiClient.get<ApiEnvelope<Category[]> | Category[]>(`/super-admin/restaurants/${restaurantId}/categories`);
    return unwrap(response.data).map(normalizeCategory);
  },
  async tables(restaurantId: number) {
    const response = await apiClient.get<ApiEnvelope<RestaurantTable[]> | RestaurantTable[]>(`/super-admin/restaurants/${restaurantId}/tables`);
    return unwrap(response.data).map(normalizeTable);
  },
};

export const invitationService = {
  async sendInvitation(email: string, role: InvitationRole, restaurantId: number): Promise<void> {
    await apiClient.post<ApiEnvelope<null> | null>('/invitations', { email, role, restaurantId } satisfies InvitationRequest);
  },
  async verifyInvitation(token: string): Promise<InvitationVerifyResponse> {
    const response = await apiClient.get<ApiEnvelope<InvitationVerifyResponse> | InvitationVerifyResponse>(
      `/invitations/verify?token=${encodeURIComponent(token)}`
    );
    return unwrap(response.data);
  },
  async acceptInvitation(token: string, name: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<ApiEnvelope<{ token: string; role: BackendRole; restaurantId?: number | null }> | { token: string; role: BackendRole; restaurantId?: number | null }>(
      '/invitations/accept',
      { token, name, password } satisfies AcceptInvitationRequest
    );
    const payload = unwrap(response.data);
    const user = buildSessionUser(payload.token, undefined, payload.role, payload.restaurantId);
    return { token: payload.token, user, role: payload.role, restaurantId: payload.restaurantId };
  },
  list: async () => {
    const response = await apiClient.get<ApiEnvelope<Invitation[]> | Invitation[]>('/invitations');
    return unwrap(response.data);
  },
  create: (payload: InviteUserPayload) =>
    withFallback(apiClient.post<Invitation>('/invitations', { ...payload, role: toBackendRole(payload.role) }), {
      id: `inv-${Date.now()}`,
      ...payload,
      restaurantName: mockRestaurants.find((restaurant) => restaurant.id === payload.restaurantId)?.name,
      status: 'PENDING',
      invitationLink: `https://tapro.app/invite/accept?token=inv-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }),
  resend: (id: string) => withFallback(apiClient.post(`/invitations/${id}/resend`), true),
  cancel: (id: string) => withFallback(apiClient.post(`/invitations/${id}/cancel`), true),
  validateToken: (token: string) =>
    withFallback(apiClient.get(`/invitations/validate?token=${token}`), {
      valid: true,
      email: 'invitee@tapro.app',
      role: normalizeRole('MANAGER'),
    }),
  accept: (token: string, password: string) =>
    withFallback(apiClient.post('/invitations/accept', { token, password }), true),
};

export const ownerStaffService = {
  list: () =>
    withFallback(
      apiClient.get<ApiEnvelope<StaffMember[]> | StaffMember[]>('/owner/staff'),
      mockStaffMembers
    ),
  enable: (id: number) =>
    withFallback(
      apiClient.put<ApiEnvelope<StaffMember> | StaffMember>(`/owner/staff/${id}/enable`),
      { ...(mockStaffMembers.find((item) => item.id === id) || mockStaffMembers[0]), id, enabled: true }
    ),
  disable: (id: number) =>
    withFallback(
      apiClient.put<ApiEnvelope<StaffMember> | StaffMember>(`/owner/staff/${id}/disable`),
      { ...(mockStaffMembers.find((item) => item.id === id) || mockStaffMembers[0]), id, enabled: false }
    ),
  resetPassword: (id: number) =>
    withFallback(apiClient.post(`/owner/staff/${id}/reset-password`), true),
};

export const ownerAnalyticsService = {
  async getAnalytics(): Promise<OwnerAnalytics> {
    const response = await apiClient.get<ApiEnvelope<OwnerAnalytics> | OwnerAnalytics>('/owner/analytics');
    return unwrap(response.data);
  },
};

export const subscriptionService = {
  // Subscription routes use realistic placeholders until the billing APIs are implemented server-side.
  plans: () => withFallback(apiClient.get<SubscriptionPlan[]>('/subscriptions/plans'), mockPlans),
  createPlan: (payload: SubscriptionPlan) =>
    withFallback(apiClient.post<SubscriptionPlan>('/subscriptions/plans', payload), payload),
  updatePlan: (payload: SubscriptionPlan) =>
    withFallback(apiClient.put<SubscriptionPlan>(`/subscriptions/plans/${payload.id}`, payload), payload),
  deletePlan: (id: string) => withFallback(apiClient.delete(`/subscriptions/plans/${id}`), true),
  subscriptions: () => withFallback(apiClient.get<Subscription[]>('/subscriptions/active'), mockSubscriptions),
  assignPlan: (restaurantId: number, planId: string) =>
    withFallback(apiClient.post('/subscriptions/assign', { restaurantId, planId }), true),
};

export const reportingService = {
  // Reporting endpoints fall back to mock analytics until backend reporting APIs are exposed.
  platformRevenue: () => withFallback(apiClient.get<ReportPoint[]>('/reports/platform-revenue'), mockReportSeries),
  restaurantGrowth: () => withFallback(apiClient.get<ReportPoint[]>('/reports/restaurant-growth'), mockReportSeries),
  orderAnalytics: () => withFallback(apiClient.get<ReportPoint[]>('/reports/order-analytics'), mockReportSeries),
};

export const dashboardService = {
  async superAdminMetrics(): Promise<DashboardMetric[]> {
    const [restaurants, orders] = await Promise.all([restaurantService.listAdmin(), orderService.list()]);
    return [
      { label: 'Total Restaurants', value: restaurants.length, helper: 'Active tenants across the platform', tone: 'blue' },
      { label: 'Total Owners', value: restaurants.length, helper: 'Owner accounts currently assigned', tone: 'emerald' },
      { label: 'Total Users', value: restaurants.length * 4, helper: 'Estimated active staff and owners', tone: 'amber' },
      { label: 'Total Orders', value: orders.length, helper: 'Orders flowing through all restaurants', tone: 'rose' },
    ];
  },
  async ownerMetrics(): Promise<DashboardMetric[]> {
    const analytics = await ownerAnalyticsService.getAnalytics();
    return [
      { label: "Today's Revenue", value: analytics.revenue.today, helper: 'Gross revenue booked today', tone: 'emerald' },
      { label: 'Orders Today', value: analytics.orders.today, helper: 'Orders created today', tone: 'blue' },
      { label: 'Average Order', value: analytics.averageOrderValue, helper: 'Average order value across non-cancelled orders', tone: 'amber' },
      { label: 'Peak Hour', value: analytics.peakOrderingHours[0] ? `${String(analytics.peakOrderingHours[0].hour).padStart(2, '0')}:00` : 'N/A', helper: 'Highest ordering hour', tone: 'rose' },
    ];
  },
  async managerMetrics(): Promise<DashboardMetric[]> {
    const orders = await orderService.list();
    return [
      { label: 'Active Orders', value: orders.filter((item) => item.status !== 'COMPLETED').length, helper: 'Open tickets in service', tone: 'blue' },
      { label: 'Daily Sales', value: `$${orders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(0)}`, helper: 'Shift revenue snapshot', tone: 'emerald' },
      { label: 'Table Usage', value: '78%', helper: 'Current seating utilization', tone: 'amber' },
    ];
  },
  kitchenMetrics: async (): Promise<DashboardMetric[]> => {
    const orders = await orderService.kitchenOrders();
    return [
      { label: 'Pending Orders', value: orders.filter((item) => item.status === 'PENDING').length, helper: 'Waiting to fire', tone: 'amber' },
      { label: 'Preparing', value: orders.filter((item) => item.status === 'PREPARING').length, helper: 'Currently in the kitchen', tone: 'blue' },
      { label: 'Ready Orders', value: orders.filter((item) => item.status === 'READY').length, helper: 'Ready for pickup or table service', tone: 'emerald' },
    ];
  },
  cashierMetrics: async (): Promise<DashboardMetric[]> => {
    const orders = await orderService.list();
    return [
      { label: 'Pending Payments', value: orders.filter((item) => item.status === 'READY').length, helper: 'Orders waiting to be settled', tone: 'amber' },
      { label: "Today's Revenue", value: `$${orders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(0)}`, helper: 'Settled and unsettled bill total', tone: 'emerald' },
    ];
  },
  activities: async (): Promise<ActivityItem[]> => withFallback(apiClient.get<ActivityItem[]>('/activities/recent'), mockActivities),
};

export const superAdminUserService = {
  async list() {
    const response = await apiClient.get<ApiEnvelope<SuperAdminUser[]> | SuperAdminUser[]>('/super-admin/users');
    return unwrap(response.data);
  },
  async listByRestaurant() {
    const response = await apiClient.get<ApiEnvelope<UsersByRestaurantGroup[]> | UsersByRestaurantGroup[]>('/super-admin/users/by-restaurant');
    return unwrap(response.data);
  },
  async create(payload: SuperAdminUserRequest) {
    const response = await apiClient.post<ApiEnvelope<SuperAdminUser> | SuperAdminUser>('/super-admin/users', payload);
    return unwrap(response.data);
  },
  async update(id: number, payload: SuperAdminUserRequest) {
    const response = await apiClient.put<ApiEnvelope<SuperAdminUser> | SuperAdminUser>(`/super-admin/users/${id}`, payload);
    return unwrap(response.data);
  },
  async enable(id: number) {
    const response = await apiClient.patch<ApiEnvelope<SuperAdminUser> | SuperAdminUser>(`/super-admin/users/${id}/enable`);
    return unwrap(response.data);
  },
  async disable(id: number) {
    const response = await apiClient.patch<ApiEnvelope<SuperAdminUser> | SuperAdminUser>(`/super-admin/users/${id}/disable`);
    return unwrap(response.data);
  },
  async delete(id: number) {
    await apiClient.delete(`/super-admin/users/${id}`);
    return true;
  },
};
