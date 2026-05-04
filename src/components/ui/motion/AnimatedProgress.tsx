import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  value: number; // 0-100
  className?: string;
  indicatorClassName?: string;
  height?: string;
  shimmer?: boolean;
}

export function AnimatedProgress({ value, className, indicatorClassName, height = 'h-2', shimmer }: Props) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setV(Math.max(0, Math.min(100, value))));
    return () => cancelAnimationFrame(id);
  }, [value]);

  return (
    <div className={cn('relative w-full overflow-hidden rounded-full bg-muted', height, className)}>
      <div
        className={cn(
          'h-full rounded-full transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
          'gradient-brand',
          shimmer && 'shimmer-bg',
          indicatorClassName
        )}
        style={{ width: `${v}%` }}
      />
    </div>
  );
}
