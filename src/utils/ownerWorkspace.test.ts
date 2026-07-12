import { MenuItem, Order, RestaurantTable, StaffMember } from '../types';
import { averageOrderValue, filterMenuItemsForOwner, filterStaffForOwner, filterTablesForOwner, orderStatusCounts, ownerReadinessSummary, safeRevenueTotal } from './ownerWorkspace';

const order = (status: Order['status'], totalAmount: number): Order => ({
  id: Math.random(),
  tableNumber: 'A1',
  status,
  totalAmount,
  orderTime: new Date().toISOString(),
  items: [],
});

const menuItem = (overrides: Partial<MenuItem>): MenuItem => ({
  id: 1,
  name: 'Rice',
  description: 'Rice bowl',
  price: 1000,
  status: 'AVAILABLE',
  featured: false,
  featuredLabel: null,
  preparationTime: 10,
  ingredients: [],
  allergens: [],
  categoryId: 1,
  categoryName: 'Mains',
  restaurantId: 1,
  ...overrides,
});

describe('ownerWorkspace utilities', () => {
  it('excludes cancelled orders from revenue and average order value', () => {
    const orders = [order('COMPLETED', 1000), order('READY', 500), order('CANCELLED', 9999)];

    expect(safeRevenueTotal(orders)).toBe(1500);
    expect(averageOrderValue(orders)).toBe(750);
  });

  it('groups all backend order statuses', () => {
    const counts = orderStatusCounts([order('PENDING', 0), order('ACCEPTED', 0), order('CANCELLED', 0)]);

    expect(counts.PENDING).toBe(1);
    expect(counts.ACCEPTED).toBe(1);
    expect(counts.CANCELLED).toBe(1);
  });

  it('summarizes owner readiness from supported fields', () => {
    const tables: RestaurantTable[] = [
      { id: 1, tableNumber: 'A1', qrCodeUrl: '/menu/1/table/1', active: true },
      { id: 2, tableNumber: 'A2', qrCodeUrl: '', active: false },
    ];
    const staff: StaffMember[] = [
      { id: 1, name: 'Chef', email: 'chef@example.com', role: 'KITCHEN', enabled: true },
      { id: 2, name: 'Waiter', email: 'waiter@example.com', role: 'STAFF', enabled: false },
    ];

    expect(ownerReadinessSummary({ items: [menuItem({}), menuItem({ status: 'HIDDEN' })], tables, staff }))
      .toMatchObject({ totalMenuItems: 2, availableMenuItems: 1, hiddenMenuItems: 1, activeTables: 1, qrReadyTables: 1, staffCount: 2, enabledStaffCount: 1 });
  });

  it('filters owner menu, table, and staff lists', () => {
    expect(filterMenuItemsForOwner([menuItem({ name: 'Tea', status: 'OUT_OF_STOCK' })], { search: 'tea', status: 'OUT_OF_STOCK' })).toHaveLength(1);
    expect(filterTablesForOwner([{ id: 1, tableNumber: 'Patio', qrCodeUrl: '', active: true }], { search: 'pat', qr: 'MISSING' })).toHaveLength(1);
    expect(filterStaffForOwner([{ id: 1, name: 'Chef', email: 'chef@example.com', role: 'KITCHEN', enabled: true }], { role: 'KITCHEN', status: 'ENABLED' })).toHaveLength(1);
  });
});

