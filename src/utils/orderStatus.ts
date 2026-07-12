import { OrderStatus } from '../types';

export const ORDER_STATUS_STEPS: Array<{ status: Exclude<OrderStatus, 'CANCELLED'>; label: string; description: string }> = [
  { status: 'PENDING', label: 'Received', description: 'The restaurant has received your order.' },
  { status: 'ACCEPTED', label: 'Accepted', description: 'The kitchen has accepted your order.' },
  { status: 'PREPARING', label: 'Preparing', description: 'Your food is being prepared.' },
  { status: 'READY', label: 'Ready', description: 'Your order is ready for service.' },
  { status: 'COMPLETED', label: 'Completed', description: 'Your order has been completed.' },
];

export const terminalOrderStatuses: OrderStatus[] = ['COMPLETED', 'CANCELLED'];

export const isTerminalOrderStatus = (status: OrderStatus) => terminalOrderStatuses.includes(status);

export const shouldPollOrderStatus = (status?: OrderStatus | null) => Boolean(status && !isTerminalOrderStatus(status));

export const orderStatusStepIndex = (status: OrderStatus) => {
  if (status === 'CANCELLED') {
    return -1;
  }

  return ORDER_STATUS_STEPS.findIndex((step) => step.status === status);
};

export const orderStatusMessage = (status: OrderStatus) => {
  if (status === 'CANCELLED') {
    return 'This order was cancelled. Please ask restaurant staff for help.';
  }

  return ORDER_STATUS_STEPS.find((step) => step.status === status)?.description || 'Order status updated.';
};

