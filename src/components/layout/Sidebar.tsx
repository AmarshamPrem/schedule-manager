import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  ListTodo,
  Target,
  BarChart3,
  Settings,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { path: '/schedule', icon: Calendar, label: 'Schedule' },
  { path: '/todos', icon: ListTodo, label: 'Todo Lists' },
  { path: '/habits', icon: Target, label: 'Habits' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { state, dispatch, getDailyStats } = useApp();
  const stats = getDailyStats();

  const toggleTheme = () => {
    dispatch({ type: 'SET_THEME', payload: state.theme === 'dark' ? 'light' : 'dark' });
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r border-border bg-sidebar transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Flame className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-sidebar-foreground">ProductiFlow</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
            <Tooltip key={item.path} delayDuration={0}>
              <TooltipTrigger asChild>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      collapsed && 'justify-center px-2',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-primary'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    )
                  }
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" className="bg-popover text-popover-foreground">
                  {item.label}
                </TooltipContent>
              )}
            </Tooltip>
          ))}
        </nav>

        {/* Stats */}
        {!collapsed && (
          <div className="border-t border-sidebar-border p-4">
            <div className="rounded-lg bg-sidebar-accent p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-sidebar-foreground/70">Today's Progress</span>
                <span className="text-xs font-medium text-sidebar-primary">{stats.productivityScore}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-sidebar-border">
                <div
                  className="h-full rounded-full bg-sidebar-primary transition-all"
                  style={{ width: `${stats.productivityScore}%` }}
                />
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs text-sidebar-foreground/70">
                <Flame className="h-3 w-3 text-warning" />
                <span>{stats.currentStreak} day streak</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-sidebar-border p-3">
          <div className={cn('flex gap-2', collapsed ? 'flex-col items-center' : 'items-center justify-between')}>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-sidebar-foreground hover:bg-sidebar-accent"
                  onClick={toggleTheme}
                >
                  {state.theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side={collapsed ? 'right' : 'top'}>
                {state.theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </TooltipContent>
            </Tooltip>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <NavLink to="/settings">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-sidebar-foreground hover:bg-sidebar-accent"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side={collapsed ? 'right' : 'top'}>Settings</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </aside>
  );
}
