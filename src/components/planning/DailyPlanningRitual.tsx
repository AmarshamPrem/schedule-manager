import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Sun, CheckCircle2, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Task } from '@/types';

interface DailyPlanningRitualProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DailyPlanningRitual({ open, onOpenChange }: DailyPlanningRitualProps) {
  const { state, dispatch, getTodayTasks, getOverdueTasks, getDailyStats } = useApp();
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set());
  
  const todayTasks = getTodayTasks();
  const overdueTasks = getOverdueTasks();
  const allPlanningTasks = [...overdueTasks, ...todayTasks];
  const stats = getDailyStats();

  const toggleConfirm = (taskId: string) => {
    setConfirmedIds(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const handleConfirmAll = () => {
    const allIds = new Set(allPlanningTasks.map(t => t.id));
    setConfirmedIds(allIds);
  };

  const handleStartDay = () => {
    // Confirm all selected tasks
    confirmedIds.forEach(id => {
      dispatch({ type: 'CONFIRM_TASK_FOR_TODAY', payload: id });
    });

    // Mark the planning as done for today
    localStorage.setItem('last-planning-date', format(new Date(), 'yyyy-MM-dd'));
    
    setConfirmedIds(new Set());
    onOpenChange(false);
  };

  const getTotalMinutes = () => {
    return allPlanningTasks
      .filter(t => confirmedIds.has(t.id))
      .reduce((sum, t) => sum + t.estimatedDuration, 0);
  };

  const totalMinutes = getTotalMinutes();
  const isOverbooked = totalMinutes > state.dailyCapacityMinutes;
  const capacityPercent = Math.min((totalMinutes / state.dailyCapacityMinutes) * 100, 100);

  const TaskRow = ({ task, isOverdue }: { task: Task; isOverdue: boolean }) => (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border p-3 transition-colors',
        confirmedIds.has(task.id) ? 'border-primary/50 bg-primary/5' : 'border-border bg-card',
        isOverdue && 'border-destructive/30'
      )}
    >
      <Checkbox
        checked={confirmedIds.has(task.id)}
        onCheckedChange={() => toggleConfirm(task.id)}
        className="h-5 w-5"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{task.title}</p>
          {task.taskType === 'hard' && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
              Must do
            </Badge>
          )}
          {isOverdue && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-destructive border-destructive/30">
              Overdue
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
          <Clock className="h-3 w-3" />
          <span>{task.estimatedDuration}min</span>
          <span>•</span>
          <span>{task.category}</span>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-warning" />
            Daily Planning
          </DialogTitle>
          <DialogDescription>
            {format(new Date(), 'EEEE, MMMM d')} — Review and confirm today's tasks
          </DialogDescription>
        </DialogHeader>

        {/* Capacity indicator */}
        <div className="space-y-2 pb-4 border-b">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Selected capacity</span>
            <span className={cn('font-medium', isOverbooked && 'text-destructive')}>
              {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m / {Math.floor(state.dailyCapacityMinutes / 60)}h
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-300 rounded-full',
                isOverbooked ? 'bg-destructive' : capacityPercent > 80 ? 'bg-warning' : 'bg-primary'
              )}
              style={{ width: `${capacityPercent}%` }}
            />
          </div>
          {isOverbooked && (
            <div className="flex items-center gap-2 text-xs text-destructive">
              <AlertTriangle className="h-3 w-3" />
              <span>You've scheduled more than your available capacity</span>
            </div>
          )}
        </div>

        {/* Task list */}
        <div className="flex-1 overflow-y-auto space-y-2 py-4 min-h-0">
          {allPlanningTasks.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">No tasks scheduled for today</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add tasks from your inbox or create new ones
              </p>
            </div>
          ) : (
            <>
              {overdueTasks.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-destructive mb-2 uppercase tracking-wide">
                    Overdue ({overdueTasks.length})
                  </p>
                  <div className="space-y-2">
                    {overdueTasks.map(task => (
                      <TaskRow key={task.id} task={task} isOverdue />
                    ))}
                  </div>
                </div>
              )}
              
              {todayTasks.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Today ({todayTasks.length})
                    </p>
                    <Button variant="ghost" size="sm" onClick={handleConfirmAll}>
                      Select all
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {todayTasks.map(task => (
                      <TaskRow key={task.id} task={task} isOverdue={false} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {confirmedIds.size} of {allPlanningTasks.length} tasks selected
          </p>
          <Button onClick={handleStartDay} disabled={confirmedIds.size === 0}>
            Start My Day
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
