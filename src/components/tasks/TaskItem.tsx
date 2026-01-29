import { useState } from 'react';
import { Task, Priority } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { cn, formatTime, getPriorityColor } from '@/lib/utils';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MoreHorizontal,
  Calendar,
  Clock,
  Flag,
  Edit,
  Trash2,
  Play,
} from 'lucide-react';

interface TaskItemProps {
  task: Task;
  compact?: boolean;
}

export function TaskItem({ task, compact = false }: TaskItemProps) {
  const { state, dispatch } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    category: task.category,
    estimatedDuration: task.estimatedDuration || 30,
  });

  const category = state.categories.find((c) => c.id === task.category);

  const handleComplete = () => {
    dispatch({ type: 'COMPLETE_TASK', payload: task.id });
  };

  const handleDelete = () => {
    dispatch({ type: 'DELETE_TASK', payload: task.id });
  };

  const handleUpdate = () => {
    dispatch({
      type: 'UPDATE_TASK',
      payload: {
        id: task.id,
        updates: {
          title: editForm.title,
          description: editForm.description,
          priority: editForm.priority,
          category: editForm.category,
          estimatedDuration: editForm.estimatedDuration,
        },
      },
    });
    setIsEditing(false);
  };

  const handleStartFocus = () => {
    dispatch({ type: 'SET_CURRENT_TASK', payload: task.id });
    dispatch({ type: 'SET_FOCUS_MODE', payload: true });
  };

  const priorityIcons = {
    low: null,
    medium: <Flag className="h-3 w-3 text-warning" />,
    high: <Flag className="h-3 w-3 text-destructive fill-destructive" />,
  };

  if (compact) {
    return (
      <div
        className={cn(
          'group flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent/50',
          task.status === 'completed' && 'opacity-60'
        )}
      >
        <Checkbox
          checked={task.status === 'completed'}
          onCheckedChange={handleComplete}
          className="h-4 w-4"
        />
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              'text-sm font-medium truncate',
              task.status === 'completed' && 'line-through text-muted-foreground'
            )}
          >
            {task.title}
          </p>
        </div>
        {priorityIcons[task.priority]}
        <span className="text-xs text-muted-foreground">
          {format(task.dueDate, 'h:mm a')}
        </span>
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          'group flex items-start gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm',
          task.status === 'completed' && 'opacity-60'
        )}
      >
        <Checkbox
          checked={task.status === 'completed'}
          onCheckedChange={handleComplete}
          className="mt-1"
        />

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <p
                className={cn(
                  'font-medium',
                  task.status === 'completed' && 'line-through text-muted-foreground'
                )}
              >
                {task.title}
              </p>
              {task.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleStartFocus}>
                  <Play className="mr-2 h-4 w-4" />
                  Focus on this
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {category && (
              <Badge
                variant="secondary"
                className="gap-1"
                style={{ backgroundColor: `${category.color}20`, color: category.color }}
              >
                <div
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
              </Badge>
            )}

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {format(task.dueDate, 'MMM d')}
            </div>

            {task.estimatedDuration && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatTime(task.estimatedDuration)}
              </div>
            )}

            {task.priority !== 'low' && (
              <div className={cn('flex items-center gap-1', getPriorityColor(task.priority))}>
                {priorityIcons[task.priority]}
                <span className="text-xs capitalize">{task.priority}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={editForm.priority}
                  onValueChange={(v) => setEditForm({ ...editForm, priority: v as Priority })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={editForm.category}
                  onValueChange={(v) => setEditForm({ ...editForm, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {state.categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Estimated Duration (minutes)</Label>
              <Input
                type="number"
                value={editForm.estimatedDuration}
                onChange={(e) =>
                  setEditForm({ ...editForm, estimatedDuration: parseInt(e.target.value) || 30 })
                }
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
