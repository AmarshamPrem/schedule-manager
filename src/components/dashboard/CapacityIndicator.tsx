import { useApp } from '@/contexts/AppContext';
import { cn, formatTime } from '@/lib/utils';
import { AnimatedProgress } from '@/components/ui/motion/AnimatedProgress';
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

  const indicatorClass =
    usagePercent >= 100
      ? '!bg-destructive !bg-none'
      : usagePercent >= 80
      ? '!bg-warning !bg-none'
      : '';

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Clock className="h-4 w-4 text-muted-foreground" />
        <div className="flex-1">
          <AnimatedProgress value={usagePercent} height="h-2" indicatorClassName={indicatorClass} />
        </div>
        <span
          className={cn(
            'text-xs font-medium font-mono tabular-nums',
            isOverbooked ? 'text-destructive' : 'text-muted-foreground'
          )}
        >
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
          <div className="flex items-center gap-1 text-destructive animate-fade-in">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs font-medium">Overbooked</span>
          </div>
        )}
      </div>

      <AnimatedProgress value={usagePercent} height="h-3" indicatorClassName={indicatorClass} />

      <div className="flex items-center justify-between text-xs text-muted-foreground font-mono tabular-nums">
        <span>{formatTime(stats.scheduledMinutes)} scheduled</span>
        <span>
          {remainingMinutes > 0
            ? `${formatTime(remainingMinutes)} available`
            : `${formatTime(stats.scheduledMinutes - stats.availableMinutes)} over`}
        </span>
      </div>
    </div>
  );
}
