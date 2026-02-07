import { useState, useEffect, useCallback } from 'react';
import { getSyncQueueCount } from '@/lib/offlineStorage';

interface OnlineStatus {
  isOnline: boolean;
  wasOffline: boolean;
  pendingSyncCount: number;
  lastOnline: Date | null;
}

export function useOnlineStatus() {
  const [status, setStatus] = useState<OnlineStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    wasOffline: false,
    pendingSyncCount: 0,
    lastOnline: null,
  });

  const updatePendingCount = useCallback(async () => {
    try {
      const count = await getSyncQueueCount();
      setStatus((prev) => ({ ...prev, pendingSyncCount: count }));
    } catch (e) {
      console.error('Failed to get sync queue count:', e);
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setStatus((prev) => ({
        ...prev,
        isOnline: true,
        wasOffline: true,
        lastOnline: new Date(),
      }));
      updatePendingCount();
    };

    const handleOffline = () => {
      setStatus((prev) => ({
        ...prev,
        isOnline: false,
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    updatePendingCount();

    // Periodic check for pending sync items
    const interval = setInterval(updatePendingCount, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [updatePendingCount]);

  return status;
}
