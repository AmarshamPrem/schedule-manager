import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
  collapsed?: boolean;
  onClick?: () => void;
}

export function NavItem({ to, icon: Icon, label, collapsed = false, onClick }: NavItemProps) {
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
      <Icon className="h-5 w-5 flex-shrink-0" />
      {!collapsed && <span>{label}</span>}
      
      {/* Tooltip for collapsed state */}
      {collapsed && (
        <span className="absolute left-full ml-2 hidden rounded bg-popover px-2 py-1 text-xs font-medium text-popover-foreground shadow-md group-hover:block z-50">
          {label}
        </span>
      )}
    </NavLink>
  );
}
