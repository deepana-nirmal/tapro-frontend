import { Order } from '../types';
import { formatWaitingTime, getKitchenNextStatus, groupKitchenOrders, mergeKitchenOrder, orderItemCount, waitingMinutes } from './staffWorkspace';

const order = (id: number, status: Order['status'], minutesAgo = 0): Order => ({
  id,
  tableNumber: `T${id}`,
  status,
  totalAmount: 1000,
  orderTime: new Date(Date.UTC(2026, 0, 1, 12, 0 - minutesAgo)).toISOString(),
  items: [
    { id: id * 10, menuItemId: id * 100, itemName: 'Rice', quantity: 2, price: 500, subTotal: 1000 },
  ],
});

describe('staffWorkspace utilities', () => {
  it('uses backend-supported kitchen transitions only', () => {
    expect(getKitchenNextStatus('PENDING')).toBe('PREPARING');
    expect(getKitchenNextStatus('PREPARING')).toBe('READY');
    expect(getKitchenNextStatus('READY')).toBe('COMPLETED');
    expect(getKitchenNextStatus('COMPLETED')).toBeNull();
    expect(getKitchenNextStatus('CANCELLED')).toBeNull();
  });

  it('groups active orders and sorts oldest first', () => {
    const grouped = groupKitchenOrders([order(2, 'PENDING', 2), order(1, 'PENDING', 10), order(3, 'READY', 1)]);

    expect(grouped.PENDING.map((entry) => entry.id)).toEqual([1, 2]);
    expect(grouped.READY.map((entry) => entry.id)).toEqual([3]);
    expect(grouped.COMPLETED).toEqual([]);
  });

  it('counts order items and formats wait time', () => {
    expect(orderItemCount(order(1, 'PENDING'))).toBe(2);
    expect(waitingMinutes('2026-01-01T12:00:00.000Z', new Date('2026-01-01T12:45:00.000Z'))).toBe(45);
    expect(formatWaitingTime(0)).toBe('Just placed');
    expect(formatWaitingTime(75)).toBe('1h 15m waiting');
  });

  it('reconciles duplicate and terminal incoming orders', () => {
    expect(mergeKitchenOrder([order(1, 'PENDING')], order(1, 'PREPARING'))[0].status).toBe('PREPARING');
    expect(mergeKitchenOrder([order(1, 'PENDING')], order(1, 'COMPLETED'))).toEqual([]);
    expect(mergeKitchenOrder([order(1, 'PENDING')], order(2, 'READY')).map((entry) => entry.id)).toEqual([1, 2]);
  });
});

