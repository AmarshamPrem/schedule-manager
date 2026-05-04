import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
  collapsed?: boolean;
  onClick?: () => void;
  badge?: number;
}

export function NavItem({ to, icon: Icon, label, collapsed = false, onClick, badge }: NavItemProps) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      end={to === '/'}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium',
          'transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          collapsed ? 'justify-center' : '',
          isActive
            ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-soft'
            : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-foreground'
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span
              aria-hidden
              className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full gradient-brand animate-scale-in"
            />
          )}
          <div className="relative">
            <Icon
              className={cn(
                'h-[18px] w-[18px] flex-shrink-0 transition-transform duration-200 ease-spring',
                'group-hover:scale-110',
                isActive && 'text-primary'
              )}
            />
            {badge !== undefined && badge > 0 && collapsed && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full gradient-brand px-1 text-[10px] font-semibold text-primary-foreground shadow-soft">
                {badge > 9 ? '9+' : badge}
              </span>
            )}
          </div>
          {!collapsed && (
            <>
              <span className="flex-1 truncate">{label}</span>
              {badge !== undefined && badge > 0 && (
                <span
                  className={cn(
                    'flex h-5 min-w-5 items-center justify-center rounded-md px-1.5 text-[11px] font-semibold tabular-nums',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-primary/10 text-primary'
                  )}
                >
                  {badge}
                </span>
              )}
            </>
          )}

          {collapsed && (
            <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs font-medium text-popover-foreground shadow-pop group-hover:block z-50">
              {label}
              {badge !== undefined && badge > 0 && (
                <span className="ml-1.5 text-primary">({badge})</span>
              )}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}
