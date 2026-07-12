const SESSION_EXPIRED_EVENT = 'tapro:session-expired';

let sessionExpiryBroadcasted = false;

export const broadcastSessionExpired = () => {
  if (sessionExpiryBroadcasted) {
    return;
  }

  sessionExpiryBroadcasted = true;
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
};

export const resetSessionExpiredBroadcast = () => {
  sessionExpiryBroadcasted = false;
};

export const onSessionExpired = (handler: () => void) => {
  window.addEventListener(SESSION_EXPIRED_EVENT, handler);
  return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handler);
};

