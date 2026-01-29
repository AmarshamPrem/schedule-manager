// Core Types for Productivity Dashboard

export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in-progress' | 'completed';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'custom';
export type HabitFrequency = 'daily' | 'weekdays' | 'weekends' | 'custom';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: Date;
  dueTime?: string;
  estimatedDuration?: number; // in minutes
  category: string;
  recurrence: RecurrenceType;
  customRecurrence?: number[]; // days of week (0-6)
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  order: number;
  timeSlot?: { start: string; end: string };
}

export interface TodoList {
  id: string;
  name: string;
  color: string;
  items: TodoItem[];
  createdAt: Date;
  archived: boolean;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  frequency: HabitFrequency;
  customDays?: number[];
  goal: number; // target days
  startDate: Date;
  color: string;
  icon?: string;
  completedDates: string[]; // ISO date strings
  missedDates: string[];
  currentStreak: number;
  longestStreak: number;
  streakFreezes: number;
  createdAt: Date;
}

export interface Streak {
  id: string;
  type: 'task' | 'habit';
  referenceId?: string;
  current: number;
  longest: number;
  lastCompletedDate: string;
  freezesUsed: number;
  maxFreezes: number;
}

export interface AnalyticsSnapshot {
  date: string;
  tasksCompleted: number;
  tasksMissed: number;
  habitsCompleted: number;
  habitsMissed: number;
  productivityScore: number;
  focusMinutes: number;
}

export interface DailyStats {
  tasksCompleted: number;
  tasksDue: number;
  habitsCompleted: number;
  habitsTotal: number;
  currentStreak: number;
  productivityScore: number;
}

export interface TimeBlock {
  id: string;
  taskId?: string;
  startTime: string; // HH:mm
  endTime: string;
  title?: string;
  color?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  preferences: UserPreferences;
  createdAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  defaultView: 'today' | 'week' | 'month';
  workingHours: { start: string; end: string };
  focusMode: boolean;
  notifications: boolean;
}
