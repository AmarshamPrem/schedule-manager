import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TaskList } from '@/components/tasks/TaskList';
import { QuickAddTask } from '@/components/dashboard/QuickAddTask';
import { FocusMode } from '@/components/focus/FocusMode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const TasksPage = () => {
  const {
    state,
    getTodayTasks,
    getUpcomingTasks,
    getOverdueTasks,
    getCompletedTasks,
    getTasksByCategory,
  } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('today');

  if (state.focusMode) {
    return <FocusMode />;
  }

  const todayTasks = getTodayTasks();
  const upcomingTasks = getUpcomingTasks();
  const overdueTasks = getOverdueTasks();
  const completedTasks = getCompletedTasks();

  const filterTasks = (tasks: typeof todayTasks) => {
    let filtered = tasks;

    if (searchQuery) {
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((t) => t.category === categoryFilter);
    }

    return filtered;
  };

  const tabCounts = {
    today: todayTasks.length,
    upcoming: upcomingTasks.length,
    overdue: overdueTasks.length,
    completed: completedTasks.length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">Manage and organize your tasks</p>
        </div>

        {/* Quick Add */}
        <Card>
          <CardContent className="pt-4">
            <QuickAddTask />
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {state.categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    {cat.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start">
            <TabsTrigger value="today" className="gap-2">
              Today
              {tabCounts.today > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {tabCounts.today}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="gap-2">
              Upcoming
              {tabCounts.upcoming > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {tabCounts.upcoming}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="overdue" className="gap-2">
              Overdue
              {tabCounts.overdue > 0 && (
                <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                  {tabCounts.overdue}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              Completed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="mt-6">
            <TaskList
              tasks={filterTasks(todayTasks)}
              emptyMessage="No tasks due today"
            />
          </TabsContent>

          <TabsContent value="upcoming" className="mt-6">
            <TaskList
              tasks={filterTasks(upcomingTasks)}
              emptyMessage="No upcoming tasks"
            />
          </TabsContent>

          <TabsContent value="overdue" className="mt-6">
            <TaskList
              tasks={filterTasks(overdueTasks)}
              emptyMessage="No overdue tasks"
            />
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <TaskList
              tasks={filterTasks(completedTasks)}
              emptyMessage="No completed tasks"
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default TasksPage;
