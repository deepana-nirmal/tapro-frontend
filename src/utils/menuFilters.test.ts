import { MenuItem } from '../types';
import { filterMenuItems } from './menuFilters';

const item = (overrides: Partial<MenuItem>): MenuItem => ({
  id: 1,
  name: 'Rice Bowl',
  description: 'Steamed rice and curry',
  price: 1000,
  status: 'AVAILABLE',
  featured: false,
  featuredLabel: null,
  preparationTime: 10,
  ingredients: [],
  allergens: [],
  categoryId: 10,
  categoryName: 'Mains',
  restaurantId: 1,
  ...overrides,
});

const resolver = {
  valueFor: (menuItem: MenuItem) => String(menuItem.categoryId),
  labelFor: (menuItem: MenuItem) => menuItem.categoryName || 'Uncategorized',
};

describe('filterMenuItems', () => {
  it('filters by category, availability, featured state, and search text', () => {
    const items = [
      item({ id: 1, name: 'Rice Bowl', featured: true, ingredients: ['coconut'] }),
      item({ id: 2, name: 'Iced Tea', categoryId: 20, categoryName: 'Drinks' }),
      item({ id: 3, name: 'Hidden Soup', status: 'HIDDEN' }),
    ];

    expect(filterMenuItems(items, { category: '10', availableOnly: true, featuredOnly: true, search: 'coconut' }, resolver))
      .toEqual([items[0]]);
  });

  it('returns all items when no restrictive filters are set', () => {
    const items = [item({ id: 1 }), item({ id: 2, status: 'OUT_OF_STOCK' })];

    expect(filterMenuItems(items, { category: 'all' }, resolver)).toEqual(items);
  });
});

