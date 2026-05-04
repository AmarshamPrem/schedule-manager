import { ReactNode, useState } from 'react';
import { Sidebar } from '@/components/navigation/Sidebar';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { state } = useApp();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (state.focusMode) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar onCollapsedChange={setSidebarCollapsed} />

      <main
        className={cn(
          'min-h-screen transition-[margin] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
          'pt-16 md:pt-0',
          sidebarCollapsed ? 'md:ml-16' : 'md:ml-60'
        )}
      >
        <div className="h-screen overflow-y-auto scrollbar-thin">
          <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
