import {
  getSyncQueue,
  removeSyncQueueItem,
  updateSyncQueueItem,
  SyncQueueItem,
} from './offlineStorage';

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

type SyncCallback = (item: SyncQueueItem) => Promise<boolean>;

class SyncManager {
  private isProcessing = false;
  private syncCallbacks: Map<string, SyncCallback> = new Map();
  private listeners: Set<() => void> = new Set();

  registerSyncHandler(type: SyncQueueItem['type'], callback: SyncCallback) {
    this.syncCallbacks.set(type, callback);
  }

  addListener(callback: () => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners() {
    this.listeners.forEach((cb) => cb());
  }

  async processQueue(): Promise<void> {
    if (this.isProcessing || !navigator.onLine) return;

    this.isProcessing = true;
    
    try {
      const queue = await getSyncQueue();
      
      for (const item of queue) {
        const callback = this.syncCallbacks.get(item.type);
        
        if (!callback) {
          // No handler registered, skip but don't remove
          console.warn(`No sync handler for type: ${item.type}`);
          continue;
        }

        try {
          const success = await callback(item);
          
          if (success) {
            await removeSyncQueueItem(item.id);
            this.notifyListeners();
          } else {
            // Increment retry count
            const updatedItem = { ...item, retries: item.retries + 1 };
            
            if (updatedItem.retries >= MAX_RETRIES) {
              console.error(`Max retries reached for sync item: ${item.id}`);
              // Optionally remove failed items after max retries
              await removeSyncQueueItem(item.id);
            } else {
              await updateSyncQueueItem(updatedItem);
            }
          }
        } catch (error) {
          console.error(`Error processing sync item: ${item.id}`, error);
          
          const updatedItem = { ...item, retries: item.retries + 1 };
          if (updatedItem.retries >= MAX_RETRIES) {
            await removeSyncQueueItem(item.id);
          } else {
            await updateSyncQueueItem(updatedItem);
          }
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  startAutoSync(intervalMs: number = 30000): () => void {
    // Process immediately when coming online
    const handleOnline = () => {
      setTimeout(() => this.processQueue(), 1000);
    };

    window.addEventListener('online', handleOnline);

    // Periodic sync
    const interval = setInterval(() => {
      if (navigator.onLine) {
        this.processQueue();
      }
    }, intervalMs);

    // Initial sync if online
    if (navigator.onLine) {
      this.processQueue();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      clearInterval(interval);
    };
  }
}

export const syncManager = new SyncManager();
