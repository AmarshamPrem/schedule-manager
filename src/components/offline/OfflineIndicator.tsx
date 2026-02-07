import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { cn } from '@/lib/utils';
import { Wifi, WifiOff, CloudOff, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface OfflineIndicatorProps {
  className?: string;
}

export function OfflineIndicator({ className }: OfflineIndicatorProps) {
  const { isOnline, pendingSyncCount, wasOffline } = useOnlineStatus();

  // Don't show anything if online with no pending syncs and never went offline
  if (isOnline && pendingSyncCount === 0 && !wasOffline) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
            isOnline
              ? pendingSyncCount > 0
                ? 'bg-warning/10 text-warning border border-warning/20'
                : 'bg-success/10 text-success border border-success/20'
              : 'bg-destructive/10 text-destructive border border-destructive/20',
            className
          )}
        >
          {isOnline ? (
            pendingSyncCount > 0 ? (
              <>
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>Syncing {pendingSyncCount}</span>
              </>
            ) : (
              <>
                <Wifi className="h-3 w-3" />
                <span>Online</span>
              </>
            )
          ) : (
            <>
              <WifiOff className="h-3 w-3" />
              <span>Offline</span>
              {pendingSyncCount > 0 && (
                <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                  {pendingSyncCount}
                </Badge>
              )}
            </>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {isOnline ? (
          pendingSyncCount > 0 ? (
            <p>{pendingSyncCount} changes waiting to sync</p>
          ) : (
            <p>All changes synced</p>
          )
        ) : (
          <div className="space-y-1">
            <p className="font-medium">You're offline</p>
            <p className="text-muted-foreground">
              Changes will sync when you reconnect
              {pendingSyncCount > 0 && ` (${pendingSyncCount} pending)`}
            </p>
          </div>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

export function OfflineBanner() {
  const { isOnline, pendingSyncCount } = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-warning/90 text-warning-foreground px-4 py-2 text-sm text-center flex items-center justify-center gap-2">
      <CloudOff className="h-4 w-4" />
      <span>
        You're offline. Changes are saved locally and will sync when you reconnect.
        {pendingSyncCount > 0 && ` (${pendingSyncCount} pending)`}
      </span>
    </div>
  );
}
