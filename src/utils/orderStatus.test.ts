import { orderStatusMessage, orderStatusStepIndex, shouldPollOrderStatus } from './orderStatus';

describe('orderStatus', () => {
  it('maps accepted into the customer timeline', () => {
    expect(orderStatusStepIndex('ACCEPTED')).toBe(1);
    expect(orderStatusMessage('ACCEPTED')).toContain('accepted');
  });

  it('polls only active orders', () => {
    expect(shouldPollOrderStatus('PENDING')).toBe(true);
    expect(shouldPollOrderStatus('COMPLETED')).toBe(false);
    expect(shouldPollOrderStatus('CANCELLED')).toBe(false);
  });
});

