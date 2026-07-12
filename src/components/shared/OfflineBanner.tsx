import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineBanner = () => {
  const [offline, setOffline] = useState(() => typeof navigator !== 'undefined' && !navigator.onLine);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div role="status" aria-live="polite" className="fixed inset-x-3 top-[max(0.75rem,env(safe-area-inset-top))] z-[var(--z-toast)] mx-auto flex max-w-xl items-center gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900 shadow-lg dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
      <WifiOff aria-hidden className="h-5 w-5 shrink-0" />
      <span>You are offline. Network actions will retry when your connection returns.</span>
    </div>
  );
};
