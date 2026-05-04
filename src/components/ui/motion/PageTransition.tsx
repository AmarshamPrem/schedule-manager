import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface Props {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className = '' }: Props) {
  const location = useLocation();
  return (
    <div key={location.pathname} className={`animate-fade-in-up ${className}`}>
      {children}
    </div>
  );
}
