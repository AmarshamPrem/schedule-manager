import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useKeyboardShortcuts, GLOBAL_SHORTCUTS, getShortcutLabel } from '@/hooks/useKeyboardShortcuts';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Target,
  BarChart3,
  Settings,
  Plus,
  Inbox,
  Search,
  FileDown,
  FileUp,
  Focus,
  Sun,
  Moon,
} from 'lucide-react';
import { format } from 'date-fns';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: () => void;
  onImport: () => void;
}

export function CommandPalette({ open, onOpenChange, onExport, onImport }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { state, dispatch, getTodayTasks, getInboxTasks } = useApp();
  const [search, setSearch] = useState('');

  // Reset search when dialog opens
  useEffect(() => {
    if (open) setSearch('');
  }, [open]);

  const todayTasks = getTodayTasks();
  const inboxTasks = getInboxTasks();

  const filteredTasks = useMemo(() => {
    if (!search) return [];
    const query = search.toLowerCase();
    return state.tasks
      .filter(t => 
        t.title.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query)
      )
      .slice(0, 5);
  }, [search, state.tasks]);

  const filteredHabits = useMemo(() => {
    if (!search) return [];
    const query = search.toLowerCase();
    return state.habits
      .filter(h => h.name.toLowerCase().includes(query))
      .slice(0, 3);
  }, [search, state.habits]);

  const handleNavigate = (path: string) => {
    navigate(path);
    onOpenChange(false);
  };

  const handleToggleTheme = () => {
    dispatch({ type: 'SET_THEME', payload: state.theme === 'dark' ? 'light' : 'dark' });
    onOpenChange(false);
  };

  const handleToggleFocus = () => {
    dispatch({ type: 'SET_FOCUS_MODE', payload: !state.focusMode });
    onOpenChange(false);
  };

  const handleSelectTask = (taskId: string) => {
    dispatch({ type: 'SET_CURRENT_TASK', payload: taskId });
    navigate('/tasks');
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Search tasks, habits, or type a command..." 
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Quick Actions */}
        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => handleNavigate('/inbox')}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Add Task to Inbox</span>
            <CommandShortcut>{getShortcutLabel(GLOBAL_SHORTCUTS.addTask)}</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={handleToggleFocus}>
            <Focus className="mr-2 h-4 w-4" />
            <span>{state.focusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}</span>
            <CommandShortcut>{getShortcutLabel(GLOBAL_SHORTCUTS.toggleFocusMode)}</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={handleToggleTheme}>
            {state.theme === 'dark' ? (
              <Sun className="mr-2 h-4 w-4" />
            ) : (
              <Moon className="mr-2 h-4 w-4" />
            )}
            <span>Toggle {state.theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Navigation */}
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => handleNavigate('/')}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate('/inbox')}>
            <Inbox className="mr-2 h-4 w-4" />
            <span>Inbox</span>
            {inboxTasks.length > 0 && (
              <span className="ml-auto text-xs text-muted-foreground">{inboxTasks.length}</span>
            )}
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate('/tasks')}>
            <CheckSquare className="mr-2 h-4 w-4" />
            <span>Tasks</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate('/schedule')}>
            <Calendar className="mr-2 h-4 w-4" />
            <span>Planner</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate('/habits')}>
            <Target className="mr-2 h-4 w-4" />
            <span>Habits</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate('/analytics')}>
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Analytics</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate('/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Data */}
        <CommandGroup heading="Data">
          <CommandItem onSelect={() => { onExport(); onOpenChange(false); }}>
            <FileDown className="mr-2 h-4 w-4" />
            <span>Export Data (JSON)</span>
          </CommandItem>
          <CommandItem onSelect={() => { onImport(); onOpenChange(false); }}>
            <FileUp className="mr-2 h-4 w-4" />
            <span>Import Data</span>
          </CommandItem>
        </CommandGroup>

        {/* Search Results */}
        {filteredTasks.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Tasks">
              {filteredTasks.map((task) => (
                <CommandItem key={task.id} onSelect={() => handleSelectTask(task.id)}>
                  <CheckSquare className="mr-2 h-4 w-4" />
                  <span className="flex-1 truncate">{task.title}</span>
                  {task.dueDate && (
                    <span className="text-xs text-muted-foreground">
                      {format(task.dueDate, 'MMM d')}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {filteredHabits.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Habits">
              {filteredHabits.map((habit) => (
                <CommandItem key={habit.id} onSelect={() => handleNavigate('/habits')}>
                  <Target className="mr-2 h-4 w-4" />
                  <span>{habit.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {habit.currentStreak} day streak
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
