import { broadcastSessionExpired, onSessionExpired, resetSessionExpiredBroadcast } from './sessionEvents';

describe('sessionEvents', () => {
  beforeEach(() => {
    resetSessionExpiredBroadcast();
  });

  it('broadcasts session expiration only once until reset', () => {
    const handler = jest.fn();
    const unsubscribe = onSessionExpired(handler);

    broadcastSessionExpired();
    broadcastSessionExpired();

    expect(handler).toHaveBeenCalledTimes(1);

    resetSessionExpiredBroadcast();
    broadcastSessionExpired();

    expect(handler).toHaveBeenCalledTimes(2);
    unsubscribe();
  });
});
