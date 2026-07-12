import { Restaurant, SuperAdminUser } from '../types';
import { filterRestaurantsForSuperAdmin, safeHealthStatus, summarizePlatform, summarizeSubscriptions } from './superAdminWorkspace';

const restaurant = (overrides: Partial<Restaurant>): Restaurant => ({
  id: 1,
  name: 'Cafe',
  address: 'Colombo',
  phone: '123',
  email: 'cafe@example.com',
  description: '',
  openingHours: '',
  serviceChargePercentage: 0,
  taxPercentage: 0,
  currencyCode: 'LKR',
  themeColor: '#10b981',
  status: 'ACTIVE',
  ...overrides,
});

const user = (overrides: Partial<SuperAdminUser>): SuperAdminUser => ({
  id: 1,
  name: 'Admin',
  email: 'admin@example.com',
  role: 'SUPER_ADMIN',
  enabled: true,
  ...overrides,
});

describe('superAdminWorkspace utilities', () => {
  it('summarizes platform restaurants, users, orders, and revenue', () => {
    const summary = summarizePlatform(
      [
        restaurant({ activeOrderCount: 2, todayRevenue: 1000 }),
        restaurant({ id: 2, status: 'SUSPENDED', activeOrderCount: 3, todayRevenue: 500 }),
      ],
      [user({}), user({ id: 2, enabled: false })]
    );

    expect(summary).toMatchObject({
      totalRestaurants: 2,
      activeRestaurants: 1,
      suspendedRestaurants: 1,
      enabledUsers: 1,
      disabledUsers: 1,
      activeOrders: 5,
      todayRevenue: 1500,
    });
  });

  it('filters restaurants by search, status, and currency', () => {
    const restaurants = [
      restaurant({ name: 'Cafe One', currencyCode: 'LKR' }),
      restaurant({ id: 2, name: 'Bistro Two', status: 'SUSPENDED', currencyCode: 'USD' }),
    ];

    expect(filterRestaurantsForSuperAdmin(restaurants, { search: 'bistro', status: 'SUSPENDED', currency: 'USD' }))
      .toEqual([restaurants[1]]);
  });

  it('summarizes subscription status without inventing missing plan revenue', () => {
    expect(summarizeSubscriptions(
      [{ id: 'growth', name: 'Growth', price: 49, billingCycle: 'MONTHLY', features: [], active: true }],
      [
        { id: '1', restaurantName: 'Cafe', planName: 'Growth', status: 'ACTIVE', renewalDate: '2026-01-01' },
        { id: '2', restaurantName: 'Bistro', planName: 'Unknown', status: 'ACTIVE', renewalDate: '2026-01-01' },
        { id: '3', restaurantName: 'Trial', planName: 'Growth', status: 'TRIAL', renewalDate: '2026-01-01' },
      ]
    )).toMatchObject({
      activeSubscriptions: 2,
      trialSubscriptions: 1,
      knownActiveRevenue: 49,
      subscriptionsMissingPricing: 1,
    });
  });

  it('maps safe platform health statuses', () => {
    expect(safeHealthStatus('UP')).toBe('Operational');
    expect(safeHealthStatus('DOWN')).toBe('Unavailable');
    expect(safeHealthStatus(undefined)).toBe('Unknown');
  });
});
