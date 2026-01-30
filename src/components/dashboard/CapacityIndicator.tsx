import { useApp } from '@/contexts/AppContext';
import { cn, formatTime } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Clock } from 'lucide-react';

interface CapacityIndicatorProps {
  className?: string;
  compact?: boolean;
}

export function CapacityIndicator({ className, compact = false }: CapacityIndicatorProps) {
  const { getDailyStats } = useApp();
  const stats = getDailyStats();

  const usagePercent = Math.min((stats.scheduledMinutes / stats.availableMinutes) * 100, 100);
  const isOverbooked = stats.isOverbooked;
  const remainingMinutes = Math.max(stats.availableMinutes - stats.scheduledMinutes, 0);

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Clock className="h-4 w-4 text-muted-foreground" />
        <div className="flex-1">
          <Progress
            value={usagePercent}
            className={cn('h-2', isOverbooked && '[&>div]:bg-destructive')}
          />
        </div>
        <span className={cn('text-xs font-medium', isOverbooked ? 'text-destructive' : 'text-muted-foreground')}>
          {formatTime(stats.scheduledMinutes)}/{formatTime(stats.availableMinutes)}
        </span>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Today's Capacity</span>
        </div>
        {isOverbooked && (
          <div className="flex items-center gap-1 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs font-medium">Overbooked</span>
          </div>
        )}
      </div>
      
      <Progress
        value={usagePercent}
        className={cn('h-3', isOverbooked && '[&>div]:bg-destructive')}
      />
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {formatTime(stats.scheduledMinutes)} scheduled
        </span>
        <span>
          {remainingMinutes > 0
            ? `${formatTime(remainingMinutes)} available`
            : `${formatTime(stats.scheduledMinutes - stats.availableMinutes)} over capacity`}
        </span>
      </div>
    </div>
  );
}
