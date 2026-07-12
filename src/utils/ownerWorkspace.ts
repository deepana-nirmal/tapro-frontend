import { MenuItem, Order, OrderStatus, OwnerAnalytics, RestaurantTable, StaffMember } from '../types';

export type OwnerDatePreset = 'TODAY' | 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'THIS_MONTH' | 'ALL_TIME' | 'CUSTOM';

export const ACTIVE_OWNER_ORDER_STATUSES: OrderStatus[] = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY'];
export const TERMINAL_OWNER_ORDER_STATUSES: OrderStatus[] = ['COMPLETED', 'CANCELLED'];

export const isActiveOwnerOrder = (order: Pick<Order, 'status'>) => ACTIVE_OWNER_ORDER_STATUSES.includes(order.status);
export const isRevenueOrder = (order: Pick<Order, 'status'>) => order.status !== 'CANCELLED';

export const safeRevenueTotal = (orders: Array<Pick<Order, 'status' | 'totalAmount'>>) =>
  orders.filter(isRevenueOrder).reduce((sum, order) => sum + order.totalAmount, 0);

export const averageOrderValue = (orders: Array<Pick<Order, 'status' | 'totalAmount'>>) => {
  const revenueOrders = orders.filter(isRevenueOrder);
  if (!revenueOrders.length) {
    return 0;
  }

  return safeRevenueTotal(revenueOrders) / revenueOrders.length;
};

export const orderStatusCounts = (orders: Array<Pick<Order, 'status'>>) =>
  orders.reduce<Record<OrderStatus, number>>((counts, order) => {
    counts[order.status] += 1;
    return counts;
  }, {
    PENDING: 0,
    ACCEPTED: 0,
    PREPARING: 0,
    READY: 0,
    COMPLETED: 0,
    CANCELLED: 0,
  });

export const ownerReadinessSummary = ({
  items,
  tables,
  staff,
}: {
  items: MenuItem[];
  tables: RestaurantTable[];
  staff: StaffMember[];
}) => ({
  totalMenuItems: items.length,
  availableMenuItems: items.filter((item) => item.status === 'AVAILABLE').length,
  hiddenMenuItems: items.filter((item) => item.status === 'HIDDEN').length,
  activeTables: tables.filter((table) => table.active !== false).length,
  qrReadyTables: tables.filter((table) => Boolean(table.qrCodeUrl || table.qrImageUrl)).length,
  staffCount: staff.length,
  enabledStaffCount: staff.filter((member) => member.enabled).length,
});

export const analyticsHasData = (analytics?: OwnerAnalytics | null) =>
  Boolean(analytics && (
    analytics.revenue.today ||
    analytics.revenue.week ||
    analytics.revenue.month ||
    analytics.orders.today ||
    analytics.orders.week ||
    analytics.orders.month ||
    analytics.topSellingItems.length ||
    analytics.leastSellingItems.length ||
    analytics.peakOrderingHours.length
  ));

export const filterMenuItemsForOwner = (
  items: MenuItem[],
  filters: { search?: string; status?: MenuItem['status'] | 'ALL'; categoryId?: number | 'ALL'; featured?: 'ALL' | 'FEATURED' | 'STANDARD'; image?: 'ALL' | 'WITH_IMAGE' | 'MISSING_IMAGE' }
) => {
  const search = filters.search?.trim().toLowerCase() || '';
  return items.filter((item) => {
    if (filters.status && filters.status !== 'ALL' && item.status !== filters.status) return false;
    if (filters.categoryId && filters.categoryId !== 'ALL' && item.categoryId !== filters.categoryId) return false;
    if (filters.featured === 'FEATURED' && !item.featured) return false;
    if (filters.featured === 'STANDARD' && item.featured) return false;
    if (filters.image === 'WITH_IMAGE' && !item.imageUrl) return false;
    if (filters.image === 'MISSING_IMAGE' && item.imageUrl) return false;
    if (!search) return true;

    return [item.name, item.description, item.categoryName, item.status, item.featuredLabel || '']
      .join(' ')
      .toLowerCase()
      .includes(search);
  });
};

export const filterTablesForOwner = (
  tables: RestaurantTable[],
  filters: { search?: string; status?: 'ALL' | 'ACTIVE' | 'INACTIVE'; qr?: 'ALL' | 'READY' | 'MISSING' }
) => {
  const search = filters.search?.trim().toLowerCase() || '';
  return tables.filter((table) => {
    const active = table.active !== false;
    const hasQr = Boolean(table.qrCodeUrl || table.qrImageUrl);
    if (filters.status === 'ACTIVE' && !active) return false;
    if (filters.status === 'INACTIVE' && active) return false;
    if (filters.qr === 'READY' && !hasQr) return false;
    if (filters.qr === 'MISSING' && hasQr) return false;
    return !search || table.tableNumber.toLowerCase().includes(search);
  });
};

export const filterStaffForOwner = (
  staff: StaffMember[],
  filters: { search?: string; role?: StaffMember['role'] | 'ALL'; status?: 'ALL' | 'ENABLED' | 'DISABLED' }
) => {
  const search = filters.search?.trim().toLowerCase() || '';
  return staff.filter((member) => {
    if (filters.role && filters.role !== 'ALL' && member.role !== filters.role) return false;
    if (filters.status === 'ENABLED' && !member.enabled) return false;
    if (filters.status === 'DISABLED' && member.enabled) return false;
    return !search || [member.name, member.email, member.role].join(' ').toLowerCase().includes(search);
  });
};

