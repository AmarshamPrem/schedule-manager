import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { format, subDays, startOfDay } from 'date-fns';
import { useMemo } from 'react';

export function ProductivityChart() {
  const { state } = useApp();

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dateStr = format(date, 'yyyy-MM-dd');

      const tasksOnDate = state.tasks.filter(
        (t) => format(t.dueDate, 'yyyy-MM-dd') === dateStr
      );
      const completed = tasksOnDate.filter((t) => t.status === 'completed').length;
      const total = tasksOnDate.length;

      const habitsCompleted = state.habits.filter((h) =>
        h.completedDates.includes(dateStr)
      ).length;

      const productivity = total > 0 ? Math.round((completed / total) * 100) : 100;

      return {
        date: format(date, 'EEE'),
        fullDate: format(date, 'MMM d'),
        tasks: completed,
        total,
        habits: habitsCompleted,
        productivity,
      };
    });

    return last7Days;
  }, [state.tasks, state.habits]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Weekly Productivity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="productivityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(186, 100%, 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(186, 100%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => [`${value}%`, 'Productivity']}
              />
              <Area
                type="monotone"
                dataKey="productivity"
                stroke="hsl(186, 100%, 50%)"
                strokeWidth={2}
                fill="url(#productivityGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function TaskCompletionChart() {
  const { state } = useApp();

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dateStr = format(date, 'yyyy-MM-dd');

      const tasksOnDate = state.tasks.filter(
        (t) => format(t.dueDate, 'yyyy-MM-dd') === dateStr
      );
      const completed = tasksOnDate.filter((t) => t.status === 'completed').length;
      const pending = tasksOnDate.filter((t) => t.status !== 'completed').length;

      return {
        date: format(date, 'EEE'),
        completed,
        pending,
      };
    });

    return last7Days;
  }, [state.tasks]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Task Completion</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="completed" stackId="a" fill="hsl(142, 70%, 45%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" stackId="a" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-success" />
            <span className="text-muted-foreground">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-muted" />
            <span className="text-muted-foreground">Pending</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
