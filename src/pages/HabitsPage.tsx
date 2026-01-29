import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { HabitCard } from '@/components/habits/HabitCard';
import { HabitGrid } from '@/components/habits/HabitGrid';
import { FocusMode } from '@/components/focus/FocusMode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Target, Flame } from 'lucide-react';
import { HabitFrequency } from '@/types';

const PRESET_COLORS = [
  'hsl(186, 100%, 50%)',
  'hsl(142, 70%, 45%)',
  'hsl(340, 75%, 55%)',
  'hsl(280, 65%, 60%)',
  'hsl(38, 92%, 55%)',
  'hsl(220, 80%, 55%)',
];

const HabitsPage = () => {
  const { state, dispatch } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    frequency: 'daily' as HabitFrequency,
    goal: 30,
    color: PRESET_COLORS[0],
  });

  if (state.focusMode) {
    return <FocusMode />;
  }

  const selectedHabit = state.habits.find((h) => h.id === selectedHabitId);

  const handleCreateHabit = () => {
    if (!newHabit.name.trim()) return;

    dispatch({
      type: 'ADD_HABIT',
      payload: {
        name: newHabit.name.trim(),
        description: newHabit.description.trim() || undefined,
        frequency: newHabit.frequency,
        goal: newHabit.goal,
        color: newHabit.color,
        startDate: new Date(),
      },
    });

    setNewHabit({
      name: '',
      description: '',
      frequency: 'daily',
      goal: 30,
      color: PRESET_COLORS[0],
    });
    setIsDialogOpen(false);
  };

  // Calculate total stats
  const totalStreak = Math.max(...state.habits.map((h) => h.currentStreak), 0);
  const longestStreak = Math.max(...state.habits.map((h) => h.longestStreak), 0);
  const totalCompleted = state.habits.reduce(
    (sum, h) => sum + h.completedDates.length,
    0
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Habits</h1>
            <p className="text-muted-foreground">Build consistent habits over time</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Habit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Habit</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Habit Name</Label>
                  <Input
                    value={newHabit.name}
                    onChange={(e) =>
                      setNewHabit({ ...newHabit, name: e.target.value })
                    }
                    placeholder="e.g., Meditate, Exercise, Read..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Textarea
                    value={newHabit.description}
                    onChange={(e) =>
                      setNewHabit({ ...newHabit, description: e.target.value })
                    }
                    placeholder="What's this habit about?"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Select
                      value={newHabit.frequency}
                      onValueChange={(v) =>
                        setNewHabit({ ...newHabit, frequency: v as HabitFrequency })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekdays">Weekdays</SelectItem>
                        <SelectItem value="weekends">Weekends</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Goal (days)</Label>
                    <Input
                      type="number"
                      value={newHabit.goal}
                      onChange={(e) =>
                        setNewHabit({ ...newHabit, goal: parseInt(e.target.value) || 30 })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewHabit({ ...newHabit, color })}
                        className={`h-8 w-8 rounded-full transition-transform ${
                          newHabit.color === color
                            ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110'
                            : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <Button onClick={handleCreateHabit} className="w-full">
                  Create Habit
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        {state.habits.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                  <Flame className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalStreak}</p>
                  <p className="text-sm text-muted-foreground">Current best streak</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{longestStreak}</p>
                  <p className="text-sm text-muted-foreground">Longest streak ever</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                  <Target className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalCompleted}</p>
                  <p className="text-sm text-muted-foreground">Total completions</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Habits Grid */}
        {state.habits.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <h2 className="font-semibold">Your Habits</h2>
              <div className="space-y-4">
                {state.habits.map((habit) => (
                  <div key={habit.id} onClick={() => setSelectedHabitId(habit.id)}>
                    <HabitCard habit={habit} />
                  </div>
                ))}
              </div>
            </div>

            {selectedHabit && (
              <div className="space-y-4">
                <h2 className="font-semibold">Activity: {selectedHabit.name}</h2>
                <Card>
                  <CardContent className="p-4">
                    <HabitGrid habit={selectedHabit} months={3} />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border">
            <div className="text-center">
              <Target className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
              <p className="font-medium">No habits yet</p>
              <p className="text-sm text-muted-foreground">
                Create your first habit to start building consistency
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default HabitsPage;
