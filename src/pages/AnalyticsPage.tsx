import { useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FocusMode } from '@/components/focus/FocusMode';
import { ProductivityChart, TaskCompletionChart } from '@/components/analytics/ProductivityChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { TrendingUp, Clock, Target, CheckCircle2 } from 'lucide-react';

const AnalyticsPage = () => {
  const { state, getDailyStats } = useApp();
  const stats = getDailyStats();

  // All hooks must be before conditionals
  const weeklyData = useMemo(() => {
    const weeks = Array.from({ length: 4 }, (_, i) => {
      const weekEnd = subDays(new Date(), i * 7);
      const weekStart = subDays(weekEnd, 6);
      const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
      let completed = 0;
      let total = 0;
      days.forEach((day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayTasks = state.tasks.filter((t) => format(t.dueDate, 'yyyy-MM-dd') === dateStr);
        completed += dayTasks.filter((t) => t.status === 'completed').length;
        total += dayTasks.length;
      });
      return { week: `Week ${4 - i}`, completed, total, rate: total > 0 ? Math.round((completed / total) * 100) : 0 };
    }).reverse();
    return weeks;
  }, [state.tasks]);

  const categoryData = useMemo(() => {
    return state.categories.map((cat) => {
      const tasks = state.tasks.filter((t) => t.category === cat.id);
      const completed = tasks.filter((t) => t.status === 'completed').length;
      return { name: cat.name, value: tasks.length, completed, color: cat.color };
    }).filter((c) => c.value > 0);
  }, [state.tasks, state.categories]);

  const streakData = useMemo(() => {
    return state.habits.map((habit) => ({
      name: habit.name, current: habit.currentStreak, longest: habit.longestStreak, color: habit.color,
    }));
  }, [state.habits]);

  const avgTaskDuration = useMemo(() => {
    const tasksWithDuration = state.tasks.filter((t) => t.estimatedDuration);
    if (tasksWithDuration.length === 0) return 0;
    const total = tasksWithDuration.reduce((sum, t) => sum + (t.estimatedDuration || 0), 0);
    return Math.round(total / tasksWithDuration.length);
  }, [state.tasks]);

  const totalTasks = state.tasks.length;
  const completedTasks = state.tasks.filter((t) => t.status === 'completed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (state.focusMode) {
    return <FocusMode />;
  }


  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track your productivity over time</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedTasks}</p>
                <p className="text-sm text-muted-foreground">Tasks completed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completionRate}%</p>
                <p className="text-sm text-muted-foreground">Completion rate</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgTaskDuration}m</p>
                <p className="text-sm text-muted-foreground">Avg. task duration</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <Target className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{state.habits.length}</p>
                <p className="text-sm text-muted-foreground">Active habits</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ProductivityChart />
          <TaskCompletionChart />
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tasks by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <div className="flex items-center gap-6">
                  <div className="h-[180px] w-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          dataKey="value"
                          strokeWidth={2}
                          stroke="hsl(var(--background))"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-2">
                    {categoryData.map((cat) => (
                      <div key={cat.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="text-sm">{cat.name}</span>
                        </div>
                        <Badge variant="secondary">{cat.value}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex h-[180px] items-center justify-center text-muted-foreground">
                  No task data yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Habit Streaks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Habit Streaks</CardTitle>
            </CardHeader>
            <CardContent>
              {streakData.length > 0 ? (
                <div className="space-y-4">
                  {streakData.map((habit) => (
                    <div key={habit.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{habit.name}</span>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Current:</span>
                          <Badge variant="secondary">{habit.current}</Badge>
                          <span className="text-muted-foreground">Best:</span>
                          <Badge variant="outline">{habit.longest}</Badge>
                        </div>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${habit.longest > 0 ? (habit.current / habit.longest) * 100 : 0}%`,
                            backgroundColor: habit.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-[180px] items-center justify-center text-muted-foreground">
                  No habits tracked yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Weekly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">4-Week Task Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="weeklyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 70%, 45%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(142, 70%, 45%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="week"
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
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stroke="hsl(142, 70%, 45%)"
                    strokeWidth={2}
                    fill="url(#weeklyGradient)"
                    name="Completed"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
