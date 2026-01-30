import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';
import {
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  Target,
  BarChart3,
  Settings,
  PanelLeftClose,
  PanelLeft,
  Menu,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import { NavItem } from './NavItem';

const primaryNavItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { path: '/schedule', icon: CalendarDays, label: 'Planner' },
  { path: '/habits', icon: Target, label: 'Habits' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
];

const secondaryNavItems = [
  { path: '/settings', icon: Settings, label: 'Settings' },
];

interface SidebarProps {
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function Sidebar({ onCollapsedChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { state, dispatch } = useApp();
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Notify parent of collapse state changes
  useEffect(() => {
    onCollapsedChange?.(collapsed);
  }, [collapsed, onCollapsedChange]);

  // Handle escape key to close mobile drawer
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileOpen]);

  const toggleTheme = () => {
    dispatch({ type: 'SET_THEME', payload: state.theme === 'dark' ? 'light' : 'dark' });
  };

  const handleMobileClose = () => {
    setMobileOpen(false);
  };

  const sidebarContent = (isMobile: boolean = false) => (
    <div className="flex h-full flex-col bg-sidebar">
      {/* Header */}
      <div className={cn(
        'flex h-14 items-center border-b border-sidebar-border',
        collapsed && !isMobile ? 'justify-center px-2' : 'justify-between px-4'
      )}>
        {(!collapsed || isMobile) && (
          <span className="text-base font-semibold text-foreground">ProductiFlow</span>
        )}
        
        {isMobile ? (
          <button
            onClick={handleMobileClose}
            className="flex h-8 w-8 items-center justify-center rounded text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        ) : (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex h-8 w-8 items-center justify-center rounded text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        <div className="space-y-0.5 px-2">
          {primaryNavItems.map((item) => (
            <NavItem
              key={item.path}
              to={item.path}
              icon={item.icon}
              label={item.label}
              collapsed={collapsed && !isMobile}
              onClick={isMobile ? handleMobileClose : undefined}
            />
          ))}
        </div>
      </nav>

      {/* Secondary Navigation / Footer */}
      <div className="border-t border-sidebar-border py-2">
        <div className="space-y-0.5 px-2">
          {secondaryNavItems.map((item) => (
            <NavItem
              key={item.path}
              to={item.path}
              icon={item.icon}
              label={item.label}
              collapsed={collapsed && !isMobile}
              onClick={isMobile ? handleMobileClose : undefined}
            />
          ))}
          
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={cn(
              'group relative flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-150',
              'hover:bg-accent/50 hover:text-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar-background',
              collapsed && !isMobile ? 'justify-center' : ''
            )}
            aria-label={state.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {state.theme === 'dark' ? (
              <Sun className="h-5 w-5 flex-shrink-0" />
            ) : (
              <Moon className="h-5 w-5 flex-shrink-0" />
            )}
            {(!collapsed || isMobile) && (
              <span>{state.theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            )}
            
            {/* Tooltip for collapsed state */}
            {collapsed && !isMobile && (
              <span className="absolute left-full ml-2 hidden rounded bg-popover px-2 py-1 text-xs font-medium text-popover-foreground shadow-md group-hover:block z-50">
                {state.theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-3 z-50 flex h-10 w-10 items-center justify-center rounded border border-border bg-background text-foreground shadow-sm transition-colors duration-150 hover:bg-accent md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 hidden h-screen border-r border-sidebar-border bg-sidebar transition-[width] duration-150 md:block',
          collapsed ? 'w-16' : 'w-60'
        )}
      >
        {sidebarContent(false)}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={handleMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen w-60 border-r border-sidebar-border bg-sidebar transition-transform duration-150 md:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent(true)}
      </aside>
    </>
  );
}
