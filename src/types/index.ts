// Core Types for Productivity Dashboard

export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'skipped';
export type TaskType = 'hard' | 'soft'; // Hard = must complete, Soft = flexible
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'custom';
export type HabitFrequency = 'daily' | 'weekdays' | 'weekends' | 'custom';
export type TaskLocation = 'inbox' | 'scheduled' | 'someday';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  taskType: TaskType;
  location: TaskLocation;
  dueDate?: Date;
  dueTime?: string;
  estimatedDuration: number; // in minutes (required for capacity)
  actualDuration?: number; // tracked actual time
  category: string;
  recurrence: RecurrenceType;
  customRecurrence?: number[]; // days of week (0-6)
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  confirmedForToday: boolean; // Daily planning ritual confirmation
  lastConfirmedDate?: string; // ISO date of last confirmation
  order: number;
  timeSlot?: { start: string; end: string };
  // Task aging
  originalDueDate?: Date;
  rescheduleCount: number;
  // Carryover tracking
  carriedOverFrom?: string; // ISO date
}

export interface DailyCapacity {
  date: string; // ISO date
  totalMinutes: number; // Available work minutes
  scheduledMinutes: number; // Minutes allocated to tasks
  completedMinutes: number; // Actually completed
  fixedCommitments: FixedCommitment[];
}

export interface FixedCommitment {
  id: string;
  name: string;
  startTime: string; // HH:mm
  endTime: string;
  days: number[]; // 0-6 (Sunday-Saturday)
}

export interface CarryoverRecord {
  date: string;
  taskId: string;
  action: 'completed' | 'skipped' | 'rescheduled';
  newDate?: string;
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
  maxFreezes: number;
  createdAt: Date;
  // Habit-task bridge
  spawnsTask: boolean;
  taskDuration?: number; // minutes for spawned task
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
  tasksSkipped: number;
  habitsCompleted: number;
  habitsMissed: number;
  productivityScore: number;
  focusMinutes: number;
  plannedMinutes: number;
  actualMinutes: number;
  contextSwitches: number;
}

export interface DailyStats {
  tasksCompleted: number;
  tasksDue: number;
  habitsCompleted: number;
  habitsTotal: number;
  currentStreak: number;
  productivityScore: number;
  scheduledMinutes: number;
  availableMinutes: number;
  isOverbooked: boolean;
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
  dailyCapacityMinutes: number;
  focusMode: boolean;
  notifications: boolean;
  taskAgingDays: number; // Days before task requires re-confirmation
  fixedCommitments: FixedCommitment[];
}

export interface EndOfDayReflection {
  date: string;
  whatWorked: string;
  whatDidnt: string;
  improvement: string;
  createdAt: Date;
}

export interface WeeklyReview {
  weekStart: string;
  missedTasks: { taskId: string; reason: 'overplanning' | 'interruption' | 'avoidance' | 'other' }[];
  archivedTasks: string[];
  recommittedTasks: string[];
  notes: string;
  createdAt: Date;
}

export interface EndOfDayReflection {
  date: string;
  whatWorked: string;
  whatDidnt: string;
  improvement: string;
  createdAt: Date;
}
