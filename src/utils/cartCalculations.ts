import { CartLine } from '../types';

export const MAX_CART_QUANTITY = 99;

export type CustomerTableContext = {
  restaurantId: number;
  tableId?: number;
  tableNumber: string;
};

export const clampQuantity = (quantity: number) => {
  if (!Number.isFinite(quantity)) {
    return 1;
  }

  return Math.min(MAX_CART_QUANTITY, Math.max(1, Math.trunc(quantity)));
};

export const lineTotal = (line: Pick<CartLine, 'price' | 'quantity'>) => line.price * line.quantity;

export const cartSubtotal = (items: Array<Pick<CartLine, 'price' | 'quantity'>>) =>
  items.reduce((sum, item) => sum + lineTotal(item), 0);

export const cartItemCount = (items: Array<Pick<CartLine, 'quantity'>>) =>
  items.reduce((sum, item) => sum + item.quantity, 0);

export const sameTableContext = (left?: CustomerTableContext | null, right?: CustomerTableContext | null) => {
  if (!left || !right) {
    return false;
  }

  return left.restaurantId === right.restaurantId && left.tableNumber === right.tableNumber && left.tableId === right.tableId;
};

