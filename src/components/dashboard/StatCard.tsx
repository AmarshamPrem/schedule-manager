import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatedCounter } from '@/components/ui/motion/AnimatedCounter';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: { value: number; positive: boolean };
  className?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

const variantStyles = {
  default: 'border-border',
  primary: 'border-primary/20 bg-gradient-to-br from-primary/5 to-transparent',
  success: 'border-success/20 bg-gradient-to-br from-success/5 to-transparent',
  warning: 'border-warning/20 bg-gradient-to-br from-warning/5 to-transparent',
};

const iconStyles = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary/10 text-primary ring-1 ring-primary/20',
  success: 'bg-success/10 text-success ring-1 ring-success/20',
  warning: 'bg-warning/10 text-warning ring-1 ring-warning/20',
};

function renderValue(value: string | number) {
  if (typeof value === 'number') {
    return <AnimatedCounter value={value} className="font-mono tabular-nums" />;
  }
  // Handle "N/M" or "N%" pattern
  const pctMatch = /^(\d+(?:\.\d+)?)%$/.exec(String(value));
  if (pctMatch) {
    return (
      <>
        <AnimatedCounter value={parseFloat(pctMatch[1])} className="font-mono tabular-nums" />
        <span>%</span>
      </>
    );
  }
  const ratioMatch = /^(\d+)\/(\d+)$/.exec(String(value));
  if (ratioMatch) {
    return (
      <>
        <AnimatedCounter value={parseInt(ratioMatch[1], 10)} className="font-mono tabular-nums" />
        <span className="text-muted-foreground">/{ratioMatch[2]}</span>
      </>
    );
  }
  return <span>{value}</span>;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  className,
  variant = 'default',
}: StatCardProps) {
  return (
    <Card
      className={cn(
        'group relative overflow-hidden border shadow-soft hover-lift',
        variantStyles[variant],
        className
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight">{renderValue(value)}</span>
              {trend && (
                <span
                  className={cn(
                    'text-xs font-semibold',
                    trend.positive ? 'text-success' : 'text-destructive'
                  )}
                >
                  {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </span>
              )}
            </div>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div
            className={cn(
              'rounded-xl p-2.5 transition-transform duration-300 ease-spring group-hover:scale-110 group-hover:-rotate-3',
              iconStyles[variant]
            )}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
