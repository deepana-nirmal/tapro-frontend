import { MenuItem } from '../types';

export type CustomerMenuFilters = {
  search?: string;
  category?: string;
  availableOnly?: boolean;
  featuredOnly?: boolean;
};

export type MenuCategoryResolver = {
  valueFor: (item: MenuItem) => string;
  labelFor: (item: MenuItem) => string;
};

const normalize = (value?: string | null) => value?.trim().toLowerCase() || '';

export const filterMenuItems = (
  items: MenuItem[],
  filters: CustomerMenuFilters,
  resolver: MenuCategoryResolver
) => {
  const search = normalize(filters.search);

  return items.filter((item) => {
    if (filters.category && filters.category !== 'all' && resolver.valueFor(item) !== filters.category) {
      return false;
    }

    if (filters.availableOnly && item.status !== 'AVAILABLE') {
      return false;
    }

    if (filters.featuredOnly && !item.featured) {
      return false;
    }

    if (!search) {
      return true;
    }

    const haystack = [
      item.name,
      item.description,
      resolver.labelFor(item),
      item.ingredients.join(' '),
      item.allergens.join(' '),
    ].join(' ');

    return normalize(haystack).includes(search);
  });
};

