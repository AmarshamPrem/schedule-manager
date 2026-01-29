import { ReactNode, useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { state } = useApp();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Check for sidebar collapsed state
  useEffect(() => {
    const checkWidth = () => {
      const sidebar = document.querySelector('aside');
      if (sidebar) {
        setSidebarCollapsed(sidebar.classList.contains('w-16'));
      }
    };

    const observer = new MutationObserver(checkWidth);
    const sidebar = document.querySelector('aside');
    if (sidebar) {
      observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
    }

    return () => observer.disconnect();
  }, []);

  if (state.focusMode) {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main
        className={cn(
          'min-h-screen transition-all duration-300',
          'ml-64'
        )}
      >
        <div className="container py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
