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
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar onCollapsedChange={setSidebarCollapsed} />
      
      {/* Main content area */}
      <main
        className={cn(
          'min-h-screen transition-[margin] duration-150',
          'pt-16 md:pt-0', // Account for mobile menu button
          sidebarCollapsed ? 'md:ml-16' : 'md:ml-60'
        )}
      >
        <div className="h-screen overflow-y-auto">
          <div className="container py-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
