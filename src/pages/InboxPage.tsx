import { useApp } from '@/contexts/AppContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { InboxView } from '@/components/inbox/InboxView';
import { FocusMode } from '@/components/focus/FocusMode';

const InboxPage = () => {
  const { state } = useApp();

  if (state.focusMode) {
    return <FocusMode />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Inbox</h1>
          <p className="text-muted-foreground">
            Process and schedule your captured tasks
          </p>
        </div>
        
        <InboxView />
      </div>
    </DashboardLayout>
  );
};

export default InboxPage;
