import { Children, cloneElement, isValidElement, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  step?: number;
  initialDelay?: number;
  className?: string;
}

export function Stagger({ children, step = 60, initialDelay = 0, className = '' }: Props) {
  const arr = Children.toArray(children);
  return (
    <div className={className}>
      {arr.map((child, i) => {
        const delay = `${initialDelay + i * step}ms`;
        if (isValidElement(child)) {
          const existing = (child.props as { style?: React.CSSProperties }).style || {};
          const existingClass = (child.props as { className?: string }).className || '';
          return cloneElement(child as React.ReactElement, {
            key: child.key ?? i,
            style: { ...existing, animationDelay: delay },
            className: `${existingClass} animate-fade-in-up`.trim(),
          });
        }
        return child;
      })}
    </div>
  );
}
