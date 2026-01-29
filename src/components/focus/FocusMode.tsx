import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { cn, formatTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { X, Play, Pause, RotateCcw, Check, Coffee } from 'lucide-react';

const POMODORO_WORK = 25 * 60; // 25 minutes in seconds
const POMODORO_BREAK = 5 * 60; // 5 minutes in seconds

type TimerMode = 'work' | 'break';

export function FocusMode() {
  const { state, dispatch } = useApp();
  const [timeLeft, setTimeLeft] = useState(POMODORO_WORK);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<TimerMode>('work');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  const currentTask = state.tasks.find((t) => t.id === state.currentTaskId);

  const totalTime = mode === 'work' ? POMODORO_WORK : POMODORO_BREAK;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer completed
      if (mode === 'work') {
        setSessionsCompleted((prev) => prev + 1);
        setMode('break');
        setTimeLeft(POMODORO_BREAK);
      } else {
        setMode('work');
        setTimeLeft(POMODORO_WORK);
      }
      setIsRunning(false);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode]);

  const handleExitFocus = () => {
    dispatch({ type: 'SET_FOCUS_MODE', payload: false });
    dispatch({ type: 'SET_CURRENT_TASK', payload: null });
  };

  const handleCompleteTask = () => {
    if (currentTask) {
      dispatch({ type: 'COMPLETE_TASK', payload: currentTask.id });
    }
    handleExitFocus();
  };

  const handleReset = () => {
    setTimeLeft(mode === 'work' ? POMODORO_WORK : POMODORO_BREAK);
    setIsRunning(false);
  };

  const formatTimeDisplay = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />

      {/* Exit button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-4 z-10"
        onClick={handleExitFocus}
      >
        <X className="h-5 w-5" />
      </Button>

      <div className="relative z-10 w-full max-w-lg px-4">
        <div className="text-center">
          {/* Mode indicator */}
          <div
            className={cn(
              'mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium',
              mode === 'work'
                ? 'bg-primary/10 text-primary'
                : 'bg-success/10 text-success'
            )}
          >
            {mode === 'work' ? (
              <>Focus Session</>
            ) : (
              <>
                <Coffee className="h-4 w-4" />
                Break Time
              </>
            )}
          </div>

          {/* Current Task */}
          {currentTask && mode === 'work' && (
            <h2 className="mb-8 text-2xl font-semibold">{currentTask.title}</h2>
          )}

          {/* Timer Display */}
          <div className="mb-8">
            <div className="relative mx-auto h-64 w-64">
              {/* Background circle */}
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="4"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={mode === 'work' ? 'hsl(var(--primary))' : 'hsl(var(--success))'}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${progress * 2.827} ${282.7 - progress * 2.827}`}
                  className="transition-all duration-1000"
                />
              </svg>
              {/* Time display */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono text-5xl font-bold tracking-tight">
                  {formatTimeDisplay(timeLeft)}
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={handleReset}
            >
              <RotateCcw className="h-5 w-5" />
            </Button>

            <Button
              size="lg"
              className={cn(
                'h-16 w-16 rounded-full',
                mode === 'work' ? 'bg-primary hover:bg-primary/90' : 'bg-success hover:bg-success/90'
              )}
              onClick={() => setIsRunning(!isRunning)}
            >
              {isRunning ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 translate-x-0.5" />
              )}
            </Button>

            {currentTask && (
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={handleCompleteTask}
              >
                <Check className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Session counter */}
          <p className="mt-8 text-sm text-muted-foreground">
            {sessionsCompleted} session{sessionsCompleted !== 1 ? 's' : ''} completed
          </p>
        </div>
      </div>
    </div>
  );
}
