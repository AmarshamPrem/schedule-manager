import { format } from 'date-fns';
import { useApp } from '@/contexts/AppContext';
import { getGreeting } from '@/lib/utils';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickAddTask } from '@/components/dashboard/QuickAddTask';
import { CapacityIndicator } from '@/components/dashboard/CapacityIndicator';
import { TaskList } from '@/components/tasks/TaskList';
import { HabitCard } from '@/components/habits/HabitCard';
import { ProductivityChart } from '@/components/analytics/ProductivityChart';
import { FocusMode } from '@/components/focus/FocusMode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Target,
  TrendingUp,
  ArrowRight,
  Flame,
  Calendar,
  Inbox,
  AlertTriangle,
} from 'lucide-react';

const Dashboard = () => {
  const { state, getDailyStats, getTodayTasks, getOverdueTasks, getInboxTasks, getAgingTasks } = useApp();
  const stats = getDailyStats();
  const todayTasks = getTodayTasks();
  const overdueTasks = getOverdueTasks();
  const inboxTasks = getInboxTasks();
  const agingTasks = getAgingTasks();

  const todaysHabits = state.habits.slice(0, 3);
  const unconfirmedTasks = todayTasks.filter(t => !t.confirmedForToday);

  if (state.focusMode) {
    return <FocusMode />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {getGreeting()}{' '}
              <span className="gradient-text">there</span>
            </h1>
            <p className="mt-1 text-muted-foreground">
              <Calendar className="mr-1.5 inline-block h-4 w-4" />
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/analytics">
                View Analytics
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Tasks Today"
            value={`${stats.tasksCompleted}/${stats.tasksDue}`}
            subtitle="tasks completed"
            icon={<CheckCircle2 className="h-5 w-5" />}
            variant="primary"
          />
          <StatCard
            title="Habits Today"
            value={`${stats.habitsCompleted}/${stats.habitsTotal}`}
            subtitle="habits done"
            icon={<Target className="h-5 w-5" />}
            variant="success"
          />
          <StatCard
            title="Current Streak"
            value={stats.currentStreak}
            subtitle="days in a row"
            icon={<Flame className="h-5 w-5" />}
            variant="warning"
          />
          <StatCard
            title="Productivity"
            value={`${stats.productivityScore}%`}
            subtitle="today's score"
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </div>

        {/* Quick Add */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Add Task</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <QuickAddTask />
            <CapacityIndicator />
          </CardContent>
        </Card>

        {/* Inbox Alert */}
        {inboxTasks.length > 0 && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Inbox className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">
                  {inboxTasks.length} task{inboxTasks.length !== 1 ? 's' : ''} in inbox
                </p>
                <p className="text-sm text-muted-foreground">
                  Process and schedule your captured tasks
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/inbox">
                  Process
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Today's Tasks */}
          <div className="lg:col-span-2 space-y-4">
            {overdueTasks.length > 0 && (
              <Card className="border-destructive/20 bg-destructive/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-destructive flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Overdue Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TaskList tasks={overdueTasks} compact />
                </CardContent>
              </Card>
            )}

            {/* Aging Tasks Warning */}
            {agingTasks.length > 0 && (
              <Card className="border-warning/20 bg-warning/5">
                <CardContent className="flex items-center gap-4 p-4">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {agingTasks.length} task{agingTasks.length !== 1 ? 's' : ''} need attention
                    </p>
                    <p className="text-xs text-muted-foreground">
                      These tasks have been pending for a while
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">Today's Tasks</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/tasks">
                    View All
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <TaskList
                  tasks={todayTasks}
                  emptyMessage="No tasks for today. Add one above!"
                />
              </CardContent>
            </Card>

            {/* Productivity Chart */}
            <ProductivityChart />
          </div>

          {/* Sidebar - Habits */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Today's Habits</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/habits">
                  View All
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>

            {todaysHabits.length > 0 ? (
              <div className="space-y-4">
                {todaysHabits.map((habit) => (
                  <HabitCard key={habit.id} habit={habit} />
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Target className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No habits yet</p>
                  <Button variant="link" size="sm" asChild className="mt-2">
                    <Link to="/habits">Create your first habit</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
