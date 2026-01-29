import { Habit } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { cn, getTodayISO } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Check, Flame, MoreHorizontal, Trash2, Snowflake } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format, subDays, startOfWeek, addDays } from 'date-fns';

interface HabitCardProps {
  habit: Habit;
}

export function HabitCard({ habit }: HabitCardProps) {
  const { dispatch } = useApp();
  const today = getTodayISO();
  const isCompletedToday = habit.completedDates.includes(today);

  const handleComplete = () => {
    if (!isCompletedToday) {
      dispatch({ type: 'COMPLETE_HABIT', payload: { id: habit.id, date: today } });
    }
  };

  const handleDelete = () => {
    dispatch({ type: 'DELETE_HABIT', payload: habit.id });
  };

  const handleUseFreeze = () => {
    dispatch({ type: 'USE_STREAK_FREEZE', payload: habit.id });
  };

  // Generate last 7 days for mini calendar
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    return {
      date,
      dateStr,
      isCompleted: habit.completedDates.includes(dateStr),
      isMissed: habit.missedDates.includes(dateStr),
      isToday: dateStr === today,
    };
  });

  const progressPercent = Math.min(
    (habit.completedDates.length / habit.goal) * 100,
    100
  );

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">{habit.name}</CardTitle>
            {habit.description && (
              <p className="text-sm text-muted-foreground">{habit.description}</p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {habit.streakFreezes > 0 && (
                <DropdownMenuItem onClick={handleUseFreeze}>
                  <Snowflake className="mr-2 h-4 w-4 text-primary" />
                  Use Streak Freeze ({habit.streakFreezes})
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mini Week View */}
        <div className="flex justify-between gap-1">
          {last7Days.map(({ date, dateStr, isCompleted, isMissed, isToday }) => (
            <div key={dateStr} className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-muted-foreground">
                {format(date, 'EEE').charAt(0)}
              </span>
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-md text-xs font-medium transition-colors',
                  isCompleted && 'bg-success text-success-foreground',
                  isMissed && 'bg-destructive/20 text-destructive',
                  !isCompleted && !isMissed && 'bg-muted text-muted-foreground',
                  isToday && !isCompleted && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                )}
              >
                {isCompleted ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  format(date, 'd')
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="gap-1">
              <Flame className="h-3 w-3 text-warning" />
              {habit.currentStreak}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Best: {habit.longestStreak}
            </span>
          </div>
          <Button
            size="sm"
            variant={isCompletedToday ? 'secondary' : 'default'}
            onClick={handleComplete}
            disabled={isCompletedToday}
            className="h-8"
          >
            {isCompletedToday ? (
              <>
                <Check className="mr-1 h-3.5 w-3.5" />
                Done
              </>
            ) : (
              'Complete'
            )}
          </Button>
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Goal Progress</span>
            <span className="font-medium">
              {habit.completedDates.length} / {habit.goal} days
            </span>
          </div>
          <Progress value={progressPercent} className="h-1.5" />
        </div>
      </CardContent>
    </Card>
  );
}
