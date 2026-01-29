import { useState } from 'react';
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { useApp } from '@/contexts/AppContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DailyTimeline } from '@/components/schedule/DailyTimeline';
import { FocusMode } from '@/components/focus/FocusMode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const SchedulePage = () => {
  const { state } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date());

  if (state.focusMode) {
    return <FocusMode />;
  }

  const weekStart = startOfWeek(selectedDate);
  const weekEnd = endOfWeek(selectedDate);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const goToPreviousWeek = () => setSelectedDate(subDays(selectedDate, 7));
  const goToNextWeek = () => setSelectedDate(addDays(selectedDate, 7));
  const goToToday = () => setSelectedDate(new Date());

  const isToday = (date: Date) =>
    format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  const isSelected = (date: Date) =>
    format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');

  const getTaskCountForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return state.tasks.filter(
      (t) => format(t.dueDate, 'yyyy-MM-dd') === dateStr && t.status !== 'completed'
    ).length;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Schedule</h1>
            <p className="text-muted-foreground">Plan your day with time blocks</p>
          </div>
          <Button variant="outline" onClick={goToToday}>
            <Calendar className="mr-2 h-4 w-4" />
            Today
          </Button>
        </div>

        {/* Week Navigation */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="icon" onClick={goToPreviousWeek}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h2 className="font-semibold">
                {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
              </h2>
              <Button variant="ghost" size="icon" onClick={goToNextWeek}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day) => {
                const taskCount = getTaskCountForDate(day);
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      'flex flex-col items-center rounded-lg p-3 transition-colors',
                      isSelected(day)
                        ? 'bg-primary text-primary-foreground'
                        : isToday(day)
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-muted'
                    )}
                  >
                    <span className="text-xs font-medium opacity-70">
                      {format(day, 'EEE')}
                    </span>
                    <span className="text-lg font-semibold">{format(day, 'd')}</span>
                    {taskCount > 0 && (
                      <span
                        className={cn(
                          'mt-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium',
                          isSelected(day)
                            ? 'bg-primary-foreground/20 text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {taskCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Daily Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {format(selectedDate, 'EEEE, MMMM d')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[600px] overflow-y-auto scrollbar-thin">
              <DailyTimeline date={selectedDate} />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SchedulePage;
