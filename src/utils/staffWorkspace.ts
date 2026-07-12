import { Order, OrderStatus } from '../types';

export const STAFF_ACTIVE_STATUSES: OrderStatus[] = ['PENDING', 'PREPARING', 'READY'];
export const STAFF_TERMINAL_STATUSES: OrderStatus[] = ['COMPLETED', 'CANCELLED'];

export const STAFF_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'New',
  ACCEPTED: 'Accepted',
  PREPARING: 'Preparing',
  READY: 'Ready',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const getKitchenNextStatus = (status: OrderStatus): OrderStatus | null => {
  if (status === 'PENDING') return 'PREPARING';
  if (status === 'PREPARING') return 'READY';
  if (status === 'READY') return 'COMPLETED';
  return null;
};

export const getKitchenActionLabel = (status: OrderStatus) => {
  if (status === 'PENDING') return 'Start preparing';
  if (status === 'PREPARING') return 'Mark ready';
  if (status === 'READY') return 'Complete order';
  return 'No action available';
};

export const isActiveKitchenOrder = (order: Pick<Order, 'status'>) => STAFF_ACTIVE_STATUSES.includes(order.status);

export const sortKitchenOrders = (orders: Order[]) =>
  [...orders].sort((left, right) => new Date(left.orderTime).getTime() - new Date(right.orderTime).getTime());

export const groupKitchenOrders = (orders: Order[]) =>
  STAFF_ACTIVE_STATUSES.reduce<Record<OrderStatus, Order[]>>((groups, status) => {
    groups[status] = sortKitchenOrders(orders.filter((order) => order.status === status));
    return groups;
  }, {
    PENDING: [],
    ACCEPTED: [],
    PREPARING: [],
    READY: [],
    COMPLETED: [],
    CANCELLED: [],
  });

export const orderItemCount = (order: Pick<Order, 'items'>) =>
  order.items.reduce((sum, item) => sum + item.quantity, 0);

export const waitingMinutes = (orderTime: string, now = new Date()) => {
  const placed = new Date(orderTime).getTime();
  if (Number.isNaN(placed)) {
    return 0;
  }

  return Math.max(0, Math.floor((now.getTime() - placed) / 60000));
};

export const formatWaitingTime = (minutes: number) => {
  if (minutes < 1) return 'Just placed';
  if (minutes < 60) return `${minutes} min waiting`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining ? `${hours}h ${remaining}m waiting` : `${hours}h waiting`;
};

export const mergeKitchenOrder = (orders: Order[], incoming: Order) => {
  const active = isActiveKitchenOrder(incoming);
  const exists = orders.some((order) => order.id === incoming.id);
  if (!active) {
    return orders.filter((order) => order.id !== incoming.id);
  }
  if (exists) {
    return orders.map((order) => order.id === incoming.id ? incoming : order);
  }
  return sortKitchenOrders([...orders, incoming]);
};

