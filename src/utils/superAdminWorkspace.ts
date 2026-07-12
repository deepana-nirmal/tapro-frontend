import { Restaurant, Subscription, SubscriptionPlan, SuperAdminUser } from '../types';

export const summarizePlatform = (restaurants: Restaurant[], users: SuperAdminUser[]) => ({
  totalRestaurants: restaurants.length,
  activeRestaurants: restaurants.filter((restaurant) => (restaurant.status || 'ACTIVE') === 'ACTIVE').length,
  suspendedRestaurants: restaurants.filter((restaurant) => restaurant.status === 'SUSPENDED').length,
  enabledUsers: users.filter((user) => user.enabled).length,
  disabledUsers: users.filter((user) => !user.enabled).length,
  activeOrders: restaurants.reduce((sum, restaurant) => sum + (restaurant.activeOrderCount || 0), 0),
  todayRevenue: restaurants.reduce((sum, restaurant) => sum + (restaurant.todayRevenue || 0), 0),
});

export const filterRestaurantsForSuperAdmin = (
  restaurants: Restaurant[],
  filters: { search?: string; status?: 'ALL' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE'; currency?: 'ALL' | string }
) => {
  const search = filters.search?.trim().toLowerCase() || '';
  return restaurants.filter((restaurant) => {
    const status = restaurant.status || 'ACTIVE';
    if (filters.status && filters.status !== 'ALL' && status !== filters.status) return false;
    if (filters.currency && filters.currency !== 'ALL' && restaurant.currencyCode !== filters.currency) return false;
    if (!search) return true;
    return [restaurant.name, restaurant.email, restaurant.phone, restaurant.address]
      .join(' ')
      .toLowerCase()
      .includes(search);
  });
};

export const summarizeSubscriptions = (plans: SubscriptionPlan[], subscriptions: Subscription[]) => {
  const planPrice = new Map(plans.map((plan) => [plan.name, plan.price]));
  const activeSubscriptions = subscriptions.filter((subscription) => subscription.status === 'ACTIVE');
  const trialSubscriptions = subscriptions.filter((subscription) => subscription.status === 'TRIAL');
  const expiredSubscriptions = subscriptions.filter((subscription) => subscription.status === 'EXPIRED');
  const knownActiveRevenue = activeSubscriptions.reduce((sum, subscription) => sum + (planPrice.get(subscription.planName) || 0), 0);
  const subscriptionsMissingPricing = activeSubscriptions.filter((subscription) => !planPrice.has(subscription.planName)).length;

  return {
    activeSubscriptions: activeSubscriptions.length,
    trialSubscriptions: trialSubscriptions.length,
    expiredSubscriptions: expiredSubscriptions.length,
    knownActiveRevenue,
    subscriptionsMissingPricing,
  };
};

export const safeHealthStatus = (status?: string | null) => {
  if (status === 'UP') return 'Operational';
  if (status === 'DOWN') return 'Unavailable';
  if (status === 'DEGRADED') return 'Degraded';
  return 'Unknown';
};
