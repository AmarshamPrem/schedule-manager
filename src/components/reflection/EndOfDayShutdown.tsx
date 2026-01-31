import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, Lightbulb, Moon, ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EndOfDayShutdownProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ReflectionData {
  whatWorked: string;
  whatDidnt: string;
  improvement: string;
}

export function EndOfDayShutdown({ open, onOpenChange }: EndOfDayShutdownProps) {
  const { state, getDailyStats, getTodayTasks, dispatch } = useApp();
  const [step, setStep] = useState(0);
  const [reflection, setReflection] = useState<ReflectionData>({
    whatWorked: '',
    whatDidnt: '',
    improvement: '',
  });

  const stats = getDailyStats();
  const todayTasks = getTodayTasks();
  const incompleteTasks = todayTasks.filter(t => t.status !== 'completed');

  const steps = [
    { id: 'summary', title: 'Day Summary', icon: Moon },
    { id: 'worked', title: 'What Worked', icon: CheckCircle2 },
    { id: 'didnt', title: "What Didn't Work", icon: XCircle },
    { id: 'improvement', title: 'One Improvement', icon: Lightbulb },
    { id: 'carryover', title: 'Handle Incomplete', icon: ArrowRight },
  ];

  const handleComplete = () => {
    // Save reflection to localStorage
    const reflections = JSON.parse(localStorage.getItem('daily-reflections') || '[]');
    reflections.push({
      date: format(new Date(), 'yyyy-MM-dd'),
      ...reflection,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('daily-reflections', JSON.stringify(reflections));

    // Reset and close
    setStep(0);
    setReflection({ whatWorked: '', whatDidnt: '', improvement: '' });
    onOpenChange(false);
  };

  const handleCarryoverTask = (taskId: string, action: 'reschedule' | 'skip') => {
    if (action === 'reschedule') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      dispatch({ type: 'RESCHEDULE_TASK', payload: { id: taskId, newDate: tomorrow } });
    } else {
      dispatch({ type: 'SKIP_TASK', payload: taskId });
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 0: // Summary
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-primary">{stats.tasksCompleted}</p>
                  <p className="text-sm text-muted-foreground">Tasks completed</p>
                </CardContent>
              </Card>
              <Card className="border-success/20 bg-success/5">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-success">{stats.habitsCompleted}</p>
                  <p className="text-sm text-muted-foreground">Habits done</p>
                </CardContent>
              </Card>
            </div>
            {incompleteTasks.length > 0 && (
              <div className="rounded-lg border border-warning/20 bg-warning/5 p-4">
                <p className="text-sm font-medium text-warning">
                  {incompleteTasks.length} task{incompleteTasks.length !== 1 ? 's' : ''} incomplete
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  You'll handle these in the final step
                </p>
              </div>
            )}
            <p className="text-sm text-muted-foreground text-center">
              Take a moment to reflect on your day
            </p>
          </div>
        );

      case 1: // What worked
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-success">
              <CheckCircle2 className="h-5 w-5" />
              <Label className="text-base font-medium">What worked well today?</Label>
            </div>
            <Textarea
              placeholder="e.g., Morning focus session was productive, Batching emails worked well..."
              value={reflection.whatWorked}
              onChange={(e) => setReflection({ ...reflection, whatWorked: e.target.value })}
              className="min-h-[120px] resize-none"
            />
          </div>
        );

      case 2: // What didn't work
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-destructive">
              <XCircle className="h-5 w-5" />
              <Label className="text-base font-medium">What didn't work?</Label>
            </div>
            <Textarea
              placeholder="e.g., Got distracted by notifications, Overplanned the afternoon..."
              value={reflection.whatDidnt}
              onChange={(e) => setReflection({ ...reflection, whatDidnt: e.target.value })}
              className="min-h-[120px] resize-none"
            />
          </div>
        );

      case 3: // One improvement
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-warning">
              <Lightbulb className="h-5 w-5" />
              <Label className="text-base font-medium">One thing to improve tomorrow</Label>
            </div>
            <Textarea
              placeholder="e.g., Start with the hardest task, Limit meetings to afternoons..."
              value={reflection.improvement}
              onChange={(e) => setReflection({ ...reflection, improvement: e.target.value })}
              className="min-h-[120px] resize-none"
            />
          </div>
        );

      case 4: // Carryover
        return (
          <div className="space-y-4">
            {incompleteTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-3" />
                <p className="font-medium">All tasks completed!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Great work today
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Decide what to do with incomplete tasks:
                </p>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {incompleteTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between gap-4 rounded-lg border bg-card p-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{task.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {task.estimatedDuration}min • {task.taskType === 'hard' ? 'Must do' : 'Flexible'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCarryoverTask(task.id, 'reschedule')}
                        >
                          Tomorrow
                        </Button>
                        {task.taskType !== 'hard' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCarryoverTask(task.id, 'skip')}
                          >
                            Skip
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            End of Day Shutdown
          </DialogTitle>
          <DialogDescription>
            {format(new Date(), 'EEEE, MMMM d')}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-1 mb-4">
          {steps.map((s, i) => (
            <div
              key={s.id}
              className={cn(
                'h-1.5 w-8 rounded-full transition-colors',
                i <= step ? 'bg-primary' : 'bg-muted'
              )}
            />
          ))}
        </div>

        <div className="min-h-[250px]">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-4">
          <Button
            variant="ghost"
            onClick={() => setStep(step - 1)}
            disabled={step === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep(step + 1)}>
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleComplete}>
              Complete Shutdown
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
