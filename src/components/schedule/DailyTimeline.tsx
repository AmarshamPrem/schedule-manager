import { useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { cn, generateTimeSlots, parseTimeToMinutes, isToday } from '@/lib/utils';
import { format } from 'date-fns';
import { Task } from '@/types';

interface DailyTimelineProps {
  date?: Date;
}

export function DailyTimeline({ date = new Date() }: DailyTimelineProps) {
  const { state } = useApp();
  const timeSlots = generateTimeSlots(6, 22);
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Filter tasks for the selected date that have time slots
  const scheduledTasks = useMemo(() => {
    return state.tasks.filter((task) => {
      const taskDate = format(task.dueDate, 'yyyy-MM-dd');
      const selectedDate = format(date, 'yyyy-MM-dd');
      return taskDate === selectedDate && task.timeSlot;
    });
  }, [state.tasks, date]);

  // Calculate position for current time indicator
  const getTimePosition = (time: string) => {
    const minutes = parseTimeToMinutes(time);
    const startMinutes = 6 * 60; // 6:00 AM
    const endMinutes = 22 * 60; // 10:00 PM
    return ((minutes - startMinutes) / (endMinutes - startMinutes)) * 100;
  };

  const currentTimePosition = getTimePosition(
    `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
  );

  const getTaskForTimeSlot = (time: string): Task | undefined => {
    return scheduledTasks.find((task) => {
      if (!task.timeSlot) return false;
      return task.timeSlot.start === time;
    });
  };

  const category = (categoryId: string) =>
    state.categories.find((c) => c.id === categoryId);

  return (
    <div className="relative">
      {/* Current time indicator */}
      {isToday(date) && currentHour >= 6 && currentHour <= 22 && (
        <div
          className="absolute left-16 right-0 z-10 flex items-center"
          style={{ top: `${currentTimePosition}%` }}
        >
          <div className="h-2.5 w-2.5 rounded-full bg-destructive" />
          <div className="h-px flex-1 bg-destructive" />
        </div>
      )}

      {/* Time slots */}
      <div className="space-y-0">
        {timeSlots.map((time, index) => {
          const task = getTaskForTimeSlot(time);
          const hour = parseInt(time.split(':')[0]);
          const isPast = isToday(date) && hour < currentHour;

          return (
            <div
              key={time}
              className={cn(
                'group flex min-h-[48px] border-t border-border',
                isPast && 'opacity-50'
              )}
            >
              {/* Time label */}
              <div className="w-16 flex-shrink-0 pr-3 pt-2 text-right">
                <span className="text-xs text-muted-foreground">
                  {format(new Date().setHours(hour, 0), 'h a')}
                </span>
              </div>

              {/* Slot content */}
              <div className="flex-1 py-1">
                {task ? (
                  <div
                    className={cn(
                      'rounded-md border-l-2 bg-muted/50 p-2 transition-colors hover:bg-muted',
                      task.status === 'completed' && 'opacity-60'
                    )}
                    style={{
                      borderLeftColor: category(task.category)?.color || 'hsl(var(--primary))',
                    }}
                  >
                    <p
                      className={cn(
                        'text-sm font-medium',
                        task.status === 'completed' && 'line-through'
                      )}
                    >
                      {task.title}
                    </p>
                    {task.estimatedDuration && (
                      <p className="text-xs text-muted-foreground">
                        {task.estimatedDuration} min
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="h-full min-h-[40px] rounded-md border border-dashed border-transparent transition-colors group-hover:border-border group-hover:bg-muted/30" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
