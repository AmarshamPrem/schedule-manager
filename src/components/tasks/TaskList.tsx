import { Task } from '@/types';
import { TaskItem } from './TaskItem';
import { cn } from '@/lib/utils';

interface TaskListProps {
  tasks: Task[];
  title?: string;
  emptyMessage?: string;
  compact?: boolean;
  className?: string;
}

export function TaskList({
  tasks,
  title,
  emptyMessage = 'No tasks',
  compact = false,
  className,
}: TaskListProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {title && (
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{title}</h3>
          <span className="text-sm text-muted-foreground">{tasks.length}</span>
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border">
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <div className={cn('space-y-2', compact && 'space-y-1')}>
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} compact={compact} />
          ))}
        </div>
      )}
    </div>
  );
}
