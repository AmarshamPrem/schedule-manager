import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday as isTodayFns } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getTodayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function isToday(date: Date): boolean {
  return isTodayFns(date);
}

export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function calculateProductivityScore(
  tasksCompleted: number,
  totalTasks: number,
  habitsCompleted: number,
  totalHabits: number
): number {
  if (totalTasks === 0 && totalHabits === 0) return 100;
  
  const taskScore = totalTasks > 0 ? (tasksCompleted / totalTasks) * 100 : 100;
  const habitScore = totalHabits > 0 ? (habitsCompleted / totalHabits) * 100 : 100;
  
  return Math.round((taskScore * 0.6 + habitScore * 0.4));
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
}

export function getPriorityColor(priority: 'low' | 'medium' | 'high'): string {
  switch (priority) {
    case 'high':
      return 'text-destructive';
    case 'medium':
      return 'text-warning';
    case 'low':
      return 'text-muted-foreground';
  }
}

export function getStatusColor(status: 'pending' | 'in-progress' | 'completed'): string {
  switch (status) {
    case 'completed':
      return 'text-success';
    case 'in-progress':
      return 'text-primary';
    case 'pending':
      return 'text-muted-foreground';
  }
}

export function generateTimeSlots(startHour: number = 6, endHour: number = 22): string[] {
  const slots: string[] = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
  }
  return slots;
}

export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}
