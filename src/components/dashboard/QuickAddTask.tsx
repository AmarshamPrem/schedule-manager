import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Flag } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Priority } from '@/types';

export function QuickAddTask() {
  const { state, dispatch } = useApp();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState(state.categories[0]?.id || '');
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    dispatch({
      type: 'ADD_TASK',
      payload: {
        title: title.trim(),
        priority,
        status: 'pending',
        taskType: 'soft',
        location: 'scheduled',
        dueDate,
        category,
        recurrence: 'none',
        estimatedDuration: 30,
        confirmedForToday: true,
        rescheduleCount: 0,
      },
    });

    setTitle('');
    setPriority('medium');
    setIsExpanded(false);
  };

  const priorityColors = {
    low: 'text-muted-foreground',
    medium: 'text-warning',
    high: 'text-destructive',
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Plus className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder="Add a new task..."
            className="pl-10 bg-muted/50 border-muted focus:bg-background"
          />
        </div>
        <Button type="submit" disabled={!title.trim()}>
          Add
        </Button>
      </div>

      {isExpanded && (
        <div className="flex flex-wrap items-center gap-2 animate-fade-in">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-2">
                <Calendar className="h-3.5 w-3.5" />
                {format(dueDate, 'MMM d')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={dueDate}
                onSelect={(date) => date && setDueDate(date)}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
            <SelectTrigger className="h-8 w-28">
              <Flag className={cn('h-3.5 w-3.5 mr-1', priorityColors[priority])} />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-8 w-32">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {state.categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    {cat.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-muted-foreground"
            onClick={() => setIsExpanded(false)}
          >
            Cancel
          </Button>
        </div>
      )}
    </form>
  );
}
