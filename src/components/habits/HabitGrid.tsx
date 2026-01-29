import { Habit } from '@/types';
import { cn, getTodayISO } from '@/lib/utils';
import { format, eachDayOfInterval, startOfMonth, endOfMonth, subMonths, getDay } from 'date-fns';

interface HabitGridProps {
  habit: Habit;
  months?: number;
}

export function HabitGrid({ habit, months = 3 }: HabitGridProps) {
  const today = new Date();
  const startDate = startOfMonth(subMonths(today, months - 1));
  const endDate = endOfMonth(today);

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weeks: (Date | null)[][] = [];
  let currentWeek: (Date | null)[] = [];

  // Pad the first week with null values
  const firstDayOfWeek = getDay(days[0]);
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(null);
  }

  days.forEach((day, index) => {
    currentWeek.push(day);
    if (getDay(day) === 6 || index === days.length - 1) {
      // Pad the last week if necessary
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const todayStr = getTodayISO();

  return (
    <div className="space-y-2">
      {/* Day labels */}
      <div className="flex gap-0.5">
        <div className="w-8" />
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div
            key={i}
            className="flex h-3 w-3 items-center justify-center text-[10px] text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="flex flex-col gap-0.5">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex items-center gap-0.5">
            {/* Week label (show month on first week of each month) */}
            <div className="w-8 text-right text-[10px] text-muted-foreground pr-1">
              {week[0] && format(week[0], 'd') <= '7' ? format(week[0], 'MMM') : ''}
            </div>
            {week.map((day, dayIndex) => {
              if (!day) {
                return <div key={dayIndex} className="h-3 w-3" />;
              }

              const dateStr = format(day, 'yyyy-MM-dd');
              const isCompleted = habit.completedDates.includes(dateStr);
              const isMissed = habit.missedDates.includes(dateStr);
              const isToday = dateStr === todayStr;

              return (
                <div
                  key={dayIndex}
                  className={cn(
                    'h-3 w-3 rounded-sm transition-colors',
                    isCompleted && 'bg-success',
                    isMissed && 'bg-destructive/40',
                    !isCompleted && !isMissed && 'bg-muted',
                    isToday && 'ring-1 ring-primary ring-offset-1 ring-offset-background'
                  )}
                  title={`${format(day, 'MMM d, yyyy')}: ${isCompleted ? 'Completed' : isMissed ? 'Missed' : 'Not done'}`}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 pt-2 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-sm bg-muted" />
          <span>Not done</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-sm bg-success" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-sm bg-destructive/40" />
          <span>Missed</span>
        </div>
      </div>
    </div>
  );
}
