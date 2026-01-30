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
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar-background',
          collapsed ? 'justify-center' : '',
          isActive
            ? 'bg-accent text-primary before:absolute before:left-0 before:top-1/2 before:h-6 before:-translate-y-1/2 before:w-[3px] before:rounded-r before:bg-primary'
            : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
        )
      }
    >
      <div className="relative">
        <Icon className="h-5 w-5 flex-shrink-0" />
        {badge !== undefined && badge > 0 && collapsed && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </div>
      {!collapsed && (
        <>
          <span className="flex-1">{label}</span>
          {badge !== undefined && badge > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded bg-primary/10 px-1.5 text-xs font-medium text-primary">
              {badge}
            </span>
          )}
        </>
      )}
      
      {/* Tooltip for collapsed state */}
      {collapsed && (
        <span className="absolute left-full ml-2 hidden rounded bg-popover px-2 py-1 text-xs font-medium text-popover-foreground shadow-md group-hover:block z-50">
          {label}
          {badge !== undefined && badge > 0 && ` (${badge})`}
        </span>
      )}
    </NavLink>
  );
}
