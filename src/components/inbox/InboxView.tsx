import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Task, Priority, TaskType } from '@/types';
import { cn } from '@/lib/utils';
import { format, addDays, startOfDay, isToday } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Plus,
  Inbox,
  CalendarIcon,
  MoreHorizontal,
  Trash2,
  Clock,
  ArrowRight,
  AlertCircle,
  Shield,
  Feather,
} from 'lucide-react';

export function InboxView() {
  const { state, dispatch, getInboxTasks } = useApp();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('medium');
  const [newTaskType, setNewTaskType] = useState<TaskType>('soft');
  const [newTaskDuration, setNewTaskDuration] = useState(30);

  const inboxTasks = getInboxTasks();

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    dispatch({
      type: 'ADD_TASK',
      payload: {
        title: newTaskTitle.trim(),
        priority: newTaskPriority,
        taskType: newTaskType,
        status: 'pending',
        location: 'inbox',
        category: state.categories[0]?.id || '',
        recurrence: 'none',
        estimatedDuration: newTaskDuration,
        confirmedForToday: false,
        rescheduleCount: 0,
      },
    });

    setNewTaskTitle('');
    setNewTaskPriority('medium');
    setNewTaskType('soft');
    setNewTaskDuration(30);
  };

  const handleScheduleTask = (taskId: string, date: Date) => {
    dispatch({
      type: 'UPDATE_TASK',
      payload: {
        id: taskId,
        updates: {
          location: 'scheduled',
          dueDate: date,
          confirmedForToday: isToday(date),
          lastConfirmedDate: isToday(date) ? format(new Date(), 'yyyy-MM-dd') : undefined,
        },
      },
    });
  };

  const handleDeleteTask = (taskId: string) => {
    dispatch({ type: 'DELETE_TASK', payload: taskId });
  };

  const handleMoveSomeday = (taskId: string) => {
    dispatch({
      type: 'UPDATE_TASK',
      payload: {
        id: taskId,
        updates: { location: 'someday' },
      },
    });
  };

  const quickScheduleOptions = [
    { label: 'Today', date: startOfDay(new Date()) },
    { label: 'Tomorrow', date: startOfDay(addDays(new Date(), 1)) },
    { label: 'Next Week', date: startOfDay(addDays(new Date(), 7)) },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Add */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            Inbox
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddTask} className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Plus className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Add a task to inbox..."
                  className="pl-10 bg-muted/50 border-muted focus:bg-background"
                />
              </div>
              <Button type="submit" disabled={!newTaskTitle.trim()}>
                Add
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select value={newTaskType} onValueChange={(v) => setNewTaskType(v as TaskType)}>
                <SelectTrigger className="h-8 w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hard">
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Hard
                    </div>
                  </SelectItem>
                  <SelectItem value="soft">
                    <div className="flex items-center gap-1">
                      <Feather className="h-3 w-3" />
                      Soft
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={newTaskPriority} onValueChange={(v) => setNewTaskPriority(v as Priority)}>
                <SelectTrigger className="h-8 w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="number"
                  value={newTaskDuration}
                  onChange={(e) => setNewTaskDuration(parseInt(e.target.value) || 30)}
                  className="h-8 w-16 text-center"
                  min={5}
                  step={5}
                />
                <span className="text-xs text-muted-foreground">min</span>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Inbox Tasks */}
      {inboxTasks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium mb-1">Inbox Zero</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              All tasks have been processed. Add new tasks above or capture them as they come.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
            <span>{inboxTasks.length} tasks to process</span>
          </div>
          
          {inboxTasks.map((task) => (
            <InboxTaskItem
              key={task.id}
              task={task}
              onSchedule={handleScheduleTask}
              onDelete={handleDeleteTask}
              onMoveSomeday={handleMoveSomeday}
              quickScheduleOptions={quickScheduleOptions}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface InboxTaskItemProps {
  task: Task;
  onSchedule: (taskId: string, date: Date) => void;
  onDelete: (taskId: string) => void;
  onMoveSomeday: (taskId: string) => void;
  quickScheduleOptions: { label: string; date: Date }[];
}

function InboxTaskItem({
  task,
  onSchedule,
  onDelete,
  onMoveSomeday,
  quickScheduleOptions,
}: InboxTaskItemProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  return (
    <div className="group flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/30">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{task.title}</p>
          {task.taskType === 'hard' && (
            <Badge variant="outline" className="h-5 text-xs gap-1 border-destructive/50 text-destructive">
              <Shield className="h-3 w-3" />
              Must do
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {task.estimatedDuration}m
          </span>
          <span className="capitalize">{task.priority} priority</span>
        </div>
      </div>

      {/* Quick Schedule Buttons */}
      <div className="hidden sm:flex items-center gap-1">
        {quickScheduleOptions.map((option) => (
          <Button
            key={option.label}
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => onSchedule(task.id, option.date)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {/* Calendar Picker */}
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={undefined}
            onSelect={(date) => {
              if (date) {
                onSchedule(task.id, date);
                setCalendarOpen(false);
              }
            }}
            initialFocus
            disabled={(date) => date < startOfDay(new Date())}
          />
        </PopoverContent>
      </Popover>

      {/* More Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onMoveSomeday(task.id)}>
            <ArrowRight className="mr-2 h-4 w-4" />
            Move to Someday
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
