import { useState, useCallback } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AppProvider, useApp } from "@/contexts/AppContext";
import { useKeyboardShortcuts, GLOBAL_SHORTCUTS } from "@/hooks/useKeyboardShortcuts";
import { CommandPalette } from "@/components/command/CommandPalette";
import { DataExportImport } from "@/components/data/DataExportImport";
import { OfflineBanner } from "@/components/offline/OfflineIndicator";
import Dashboard from "./pages/Dashboard";
import TasksPage from "./pages/TasksPage";
import InboxPage from "./pages/InboxPage";
import SchedulePage from "./pages/SchedulePage";
import TodosPage from "./pages/TodosPage";
import HabitsPage from "./pages/HabitsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppWithShortcuts() {
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const [commandOpen, setCommandOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const handleExport = useCallback(() => setExportOpen(true), []);
  const handleImport = useCallback(() => setImportOpen(true), []);

  useKeyboardShortcuts([
    { ...GLOBAL_SHORTCUTS.openCommandPalette, handler: () => setCommandOpen(true) },
    { ...GLOBAL_SHORTCUTS.addTask, handler: () => navigate('/inbox') },
    { ...GLOBAL_SHORTCUTS.goToInbox, handler: () => navigate('/inbox') },
    { ...GLOBAL_SHORTCUTS.goToToday, handler: () => navigate('/') },
    { ...GLOBAL_SHORTCUTS.toggleFocusMode, handler: () => dispatch({ type: 'SET_FOCUS_MODE', payload: true }) },
    { ...GLOBAL_SHORTCUTS.escape, handler: () => setCommandOpen(false) },
  ]);

  return (
    <>
      <OfflineBanner />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inbox" element={<InboxPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/todos" element={<TodosPage />} />
        <Route path="/habits" element={<HabitsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <CommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        onExport={handleExport}
        onImport={handleImport}
      />
      <DataExportImport
        exportOpen={exportOpen}
        importOpen={importOpen}
        onExportClose={() => setExportOpen(false)}
        onImportClose={() => setImportOpen(false)}
      />
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppWithShortcuts />
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
