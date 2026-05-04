import { useCountUp } from '@/hooks/useCountUp';

interface Props {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export function AnimatedCounter({ value, decimals = 0, suffix = '', prefix = '', className }: Props) {
  const v = useCountUp(value);
  return (
    <span className={className}>
      {prefix}
      {v.toFixed(decimals)}
      {suffix}
    </span>
  );
}
