import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback, useState } from 'react';
import { Task, TodoList, Habit, Category, DailyStats, TimeBlock, FixedCommitment } from '@/types';
import { generateId, getTodayISO, isToday, calculateProductivityScore } from '@/lib/utils';
import { addDays, format, isAfter, isBefore, startOfDay, differenceInDays } from 'date-fns';
import {
  loadAllData,
  saveAllData,
  addToSyncQueue,
  SyncQueueItem,
} from '@/lib/offlineStorage';
import { syncManager } from '@/lib/syncManager';

interface AppState {
  tasks: Task[];
  todoLists: TodoList[];
  habits: Habit[];
  categories: Category[];
  timeBlocks: TimeBlock[];
  focusMode: boolean;
  currentTaskId: string | null;
  theme: 'light' | 'dark';
  // Capacity and planning settings
  dailyCapacityMinutes: number;
  taskAgingDays: number;
  fixedCommitments: FixedCommitment[];
  workingHours: { start: string; end: string };
}

type AppAction =
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'> }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'COMPLETE_TASK'; payload: string }
  | { type: 'SKIP_TASK'; payload: string }
  | { type: 'RESCHEDULE_TASK'; payload: { id: string; newDate: Date } }
  | { type: 'CONFIRM_TASK_FOR_TODAY'; payload: string }
  | { type: 'REORDER_TASKS'; payload: Task[] }
  | { type: 'ADD_TODO_LIST'; payload: Omit<TodoList, 'id' | 'createdAt' | 'archived' | 'items'> }
  | { type: 'ADD_TODO_ITEM'; payload: { listId: string; text: string } }
  | { type: 'TOGGLE_TODO_ITEM'; payload: { listId: string; itemId: string } }
  | { type: 'DELETE_TODO_ITEM'; payload: { listId: string; itemId: string } }
  | { type: 'ARCHIVE_TODO_LIST'; payload: string }
  | { type: 'ADD_HABIT'; payload: Omit<Habit, 'id' | 'createdAt' | 'completedDates' | 'missedDates' | 'currentStreak' | 'longestStreak' | 'streakFreezes'> }
  | { type: 'COMPLETE_HABIT'; payload: { id: string; date: string } }
  | { type: 'DELETE_HABIT'; payload: string }
  | { type: 'USE_STREAK_FREEZE'; payload: string }
  | { type: 'ADD_TIME_BLOCK'; payload: Omit<TimeBlock, 'id'> }
  | { type: 'UPDATE_TIME_BLOCK'; payload: { id: string; updates: Partial<TimeBlock> } }
  | { type: 'DELETE_TIME_BLOCK'; payload: string }
  | { type: 'SET_FOCUS_MODE'; payload: boolean }
  | { type: 'SET_CURRENT_TASK'; payload: string | null }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'SET_DAILY_CAPACITY'; payload: number }
  | { type: 'SET_TASK_AGING_DAYS'; payload: number }
  | { type: 'SET_WORKING_HOURS'; payload: { start: string; end: string } }
  | { type: 'ADD_FIXED_COMMITMENT'; payload: Omit<FixedCommitment, 'id'> }
  | { type: 'DELETE_FIXED_COMMITMENT'; payload: string }
  | { type: 'IMPORT_DATA'; payload: { tasks: Task[]; todoLists: TodoList[]; habits: Habit[]; categories: Category[] } }
  | { type: 'LOAD_STATE'; payload: AppState };

const defaultCategories: Category[] = [
  { id: '1', name: 'Work', color: 'hsl(186, 100%, 50%)' },
  { id: '2', name: 'Personal', color: 'hsl(142, 70%, 45%)' },
  { id: '3', name: 'Health', color: 'hsl(340, 75%, 55%)' },
  { id: '4', name: 'Learning', color: 'hsl(280, 65%, 60%)' },
  { id: '5', name: 'Finance', color: 'hsl(38, 92%, 55%)' },
];

const initialState: AppState = {
  tasks: [],
  todoLists: [],
  habits: [],
  categories: defaultCategories,
  timeBlocks: [],
  focusMode: false,
  currentTaskId: null,
  theme: 'dark',
  dailyCapacityMinutes: 480, // 8 hours
  taskAgingDays: 7,
  fixedCommitments: [],
  workingHours: { start: '09:00', end: '17:00' },
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_TASK': {
      const newTask: Task = {
        ...action.payload,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        order: state.tasks.length,
      };
      return { ...state, tasks: [...state.tasks, newTask] };
    }
    case 'UPDATE_TASK': {
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id
            ? { ...task, ...action.payload.updates, updatedAt: new Date() }
            : task
        ),
      };
    }
    case 'DELETE_TASK': {
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
      };
    }
    case 'COMPLETE_TASK': {
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload
            ? { ...task, status: 'completed', completedAt: new Date(), updatedAt: new Date() }
            : task
        ),
      };
    }
    case 'SKIP_TASK': {
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload
            ? { ...task, status: 'skipped', updatedAt: new Date() }
            : task
        ),
      };
    }
    case 'RESCHEDULE_TASK': {
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id
            ? {
                ...task,
                dueDate: action.payload.newDate,
                originalDueDate: task.originalDueDate || task.dueDate,
                rescheduleCount: task.rescheduleCount + 1,
                carriedOverFrom: task.dueDate ? format(task.dueDate, 'yyyy-MM-dd') : undefined,
                confirmedForToday: isToday(action.payload.newDate),
                lastConfirmedDate: isToday(action.payload.newDate) ? getTodayISO() : undefined,
                updatedAt: new Date(),
              }
            : task
        ),
      };
    }
    case 'CONFIRM_TASK_FOR_TODAY': {
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload
            ? { ...task, confirmedForToday: true, lastConfirmedDate: getTodayISO(), updatedAt: new Date() }
            : task
        ),
      };
    }
    case 'REORDER_TASKS': {
      return { ...state, tasks: action.payload };
    }
    case 'ADD_TODO_LIST': {
      const newList: TodoList = {
        ...action.payload,
        id: generateId(),
        createdAt: new Date(),
        archived: false,
        items: [],
      };
      return { ...state, todoLists: [...state.todoLists, newList] };
    }
    case 'ADD_TODO_ITEM': {
      return {
        ...state,
        todoLists: state.todoLists.map((list) =>
          list.id === action.payload.listId
            ? {
                ...list,
                items: [
                  ...list.items,
                  {
                    id: generateId(),
                    text: action.payload.text,
                    completed: false,
                    createdAt: new Date(),
                  },
                ],
              }
            : list
        ),
      };
    }
    case 'TOGGLE_TODO_ITEM': {
      return {
        ...state,
        todoLists: state.todoLists.map((list) =>
          list.id === action.payload.listId
            ? {
                ...list,
                items: list.items.map((item) =>
                  item.id === action.payload.itemId
                    ? {
                        ...item,
                        completed: !item.completed,
                        completedAt: !item.completed ? new Date() : undefined,
                      }
                    : item
                ),
              }
            : list
        ),
      };
    }
    case 'DELETE_TODO_ITEM': {
      return {
        ...state,
        todoLists: state.todoLists.map((list) =>
          list.id === action.payload.listId
            ? { ...list, items: list.items.filter((item) => item.id !== action.payload.itemId) }
            : list
        ),
      };
    }
    case 'ARCHIVE_TODO_LIST': {
      return {
        ...state,
        todoLists: state.todoLists.map((list) =>
          list.id === action.payload ? { ...list, archived: true } : list
        ),
      };
    }
    case 'ADD_HABIT': {
      const newHabit: Habit = {
        ...action.payload,
        id: generateId(),
        createdAt: new Date(),
        completedDates: [],
        missedDates: [],
        currentStreak: 0,
        longestStreak: 0,
        streakFreezes: action.payload.maxFreezes,
      };
      return { ...state, habits: [...state.habits, newHabit] };
    }
    case 'COMPLETE_HABIT': {
      return {
        ...state,
        habits: state.habits.map((habit) => {
          if (habit.id !== action.payload.id) return habit;
          const newCompletedDates = [...habit.completedDates, action.payload.date];
          const newStreak = habit.currentStreak + 1;
          return {
            ...habit,
            completedDates: newCompletedDates,
            currentStreak: newStreak,
            longestStreak: Math.max(habit.longestStreak, newStreak),
          };
        }),
      };
    }
    case 'DELETE_HABIT': {
      return {
        ...state,
        habits: state.habits.filter((habit) => habit.id !== action.payload),
      };
    }
    case 'USE_STREAK_FREEZE': {
      return {
        ...state,
        habits: state.habits.map((habit) =>
          habit.id === action.payload && habit.streakFreezes > 0
            ? { ...habit, streakFreezes: habit.streakFreezes - 1 }
            : habit
        ),
      };
    }
    case 'ADD_TIME_BLOCK': {
      const newBlock: TimeBlock = {
        ...action.payload,
        id: generateId(),
      };
      return { ...state, timeBlocks: [...state.timeBlocks, newBlock] };
    }
    case 'UPDATE_TIME_BLOCK': {
      return {
        ...state,
        timeBlocks: state.timeBlocks.map((block) =>
          block.id === action.payload.id ? { ...block, ...action.payload.updates } : block
        ),
      };
    }
    case 'DELETE_TIME_BLOCK': {
      return {
        ...state,
        timeBlocks: state.timeBlocks.filter((block) => block.id !== action.payload),
      };
    }
    case 'SET_FOCUS_MODE': {
      return { ...state, focusMode: action.payload };
    }
    case 'SET_CURRENT_TASK': {
      return { ...state, currentTaskId: action.payload };
    }
    case 'SET_THEME': {
      return { ...state, theme: action.payload };
    }
    case 'SET_DAILY_CAPACITY': {
      return { ...state, dailyCapacityMinutes: action.payload };
    }
    case 'SET_TASK_AGING_DAYS': {
      return { ...state, taskAgingDays: action.payload };
    }
    case 'SET_WORKING_HOURS': {
      return { ...state, workingHours: action.payload };
    }
    case 'ADD_FIXED_COMMITMENT': {
      const newCommitment: FixedCommitment = {
        ...action.payload,
        id: generateId(),
      };
      return { ...state, fixedCommitments: [...state.fixedCommitments, newCommitment] };
    }
    case 'DELETE_FIXED_COMMITMENT': {
      return {
        ...state,
        fixedCommitments: state.fixedCommitments.filter((c) => c.id !== action.payload),
      };
    }
    case 'IMPORT_DATA': {
      return {
        ...state,
        tasks: [...state.tasks, ...action.payload.tasks],
        todoLists: [...state.todoLists, ...action.payload.todoLists],
        habits: [...state.habits, ...action.payload.habits],
        categories: action.payload.categories,
      };
    }
    case 'LOAD_STATE': {
      return action.payload;
    }
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  isLoading: boolean;
  isOnline: boolean;
  getDailyStats: () => DailyStats;
  getTodayTasks: () => Task[];
  getUpcomingTasks: () => Task[];
  getOverdueTasks: () => Task[];
  getCompletedTasks: () => Task[];
  getTasksByCategory: (category: string) => Task[];
  getInboxTasks: () => Task[];
  getAgingTasks: () => Task[];
  getScheduledMinutesForDate: (date: Date) => number;
  isDateOverbooked: (date: Date) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load state from IndexedDB (primary) or localStorage (fallback/migration)
  useEffect(() => {
    async function loadData() {
      try {
        // Try loading from IndexedDB first
        const idbData = await loadAllData();
        
        if (idbData.tasks.length > 0 || idbData.habits.length > 0 || idbData.todoLists.length > 0) {
          // IndexedDB has data, use it
          dispatch({
            type: 'LOAD_STATE',
            payload: {
              ...initialState,
              tasks: idbData.tasks,
              todoLists: idbData.todoLists,
              habits: idbData.habits,
              categories: idbData.categories.length > 0 ? idbData.categories : initialState.categories,
              timeBlocks: idbData.timeBlocks,
              fixedCommitments: idbData.fixedCommitments,
              theme: idbData.metadata.theme || 'dark',
              dailyCapacityMinutes: idbData.metadata.dailyCapacityMinutes || 480,
              taskAgingDays: idbData.metadata.taskAgingDays || 7,
              workingHours: idbData.metadata.workingHours || { start: '09:00', end: '17:00' },
            },
          });
        } else {
          // Fallback: migrate from localStorage
          const saved = localStorage.getItem('productivity-dashboard-state');
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              const tasks = parsed.tasks?.map((t: any) => ({
                ...t,
                dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
                createdAt: new Date(t.createdAt),
                updatedAt: new Date(t.updatedAt),
                completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
                originalDueDate: t.originalDueDate ? new Date(t.originalDueDate) : undefined,
                taskType: t.taskType || 'soft',
                location: t.location || 'scheduled',
                estimatedDuration: t.estimatedDuration || 30,
                confirmedForToday: t.confirmedForToday || false,
                rescheduleCount: t.rescheduleCount || 0,
              })) || [];
              const todoLists = parsed.todoLists?.map((l: any) => ({
                ...l,
                createdAt: new Date(l.createdAt),
                items: l.items?.map((i: any) => ({
                  ...i,
                  createdAt: new Date(i.createdAt),
                  completedAt: i.completedAt ? new Date(i.completedAt) : undefined,
                })) || [],
              })) || [];
              const habits = parsed.habits?.map((h: any) => ({
                ...h,
                startDate: new Date(h.startDate),
                createdAt: new Date(h.createdAt),
                maxFreezes: h.maxFreezes || 3,
                spawnsTask: h.spawnsTask || false,
              })) || [];
              
              const stateToLoad = {
                ...initialState,
                ...parsed,
                tasks,
                todoLists,
                habits,
              };
              
              dispatch({ type: 'LOAD_STATE', payload: stateToLoad });
              
              // Migrate to IndexedDB
              await saveAllData({
                tasks,
                todoLists,
                habits,
                categories: parsed.categories || initialState.categories,
                timeBlocks: parsed.timeBlocks || [],
                fixedCommitments: parsed.fixedCommitments || [],
                metadata: {
                  theme: parsed.theme,
                  dailyCapacityMinutes: parsed.dailyCapacityMinutes,
                  taskAgingDays: parsed.taskAgingDays,
                  workingHours: parsed.workingHours,
                },
              });
              
              console.log('Migrated data from localStorage to IndexedDB');
            } catch (e) {
              console.error('Failed to migrate from localStorage:', e);
            }
          }
        }
      } catch (e) {
        console.error('Failed to load data:', e);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
    
    // Start sync manager
    const stopSync = syncManager.startAutoSync();
    return () => stopSync();
  }, []);

  // Save state to IndexedDB (and localStorage as backup) whenever state changes
  useEffect(() => {
    if (isLoading) return;
    
    // Save to IndexedDB
    saveAllData({
      tasks: state.tasks,
      todoLists: state.todoLists,
      habits: state.habits,
      categories: state.categories,
      timeBlocks: state.timeBlocks,
      fixedCommitments: state.fixedCommitments,
      metadata: {
        theme: state.theme,
        dailyCapacityMinutes: state.dailyCapacityMinutes,
        taskAgingDays: state.taskAgingDays,
        workingHours: state.workingHours,
      },
    }).catch((e) => console.error('Failed to save to IndexedDB:', e));
    
    // Also save to localStorage as backup
    localStorage.setItem('productivity-dashboard-state', JSON.stringify(state));
  }, [state, isLoading]);

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
  }, [state.theme]);

  const getScheduledMinutesForDate = (date: Date): number => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return state.tasks
      .filter((t) => t.dueDate && format(t.dueDate, 'yyyy-MM-dd') === dateStr && t.status !== 'completed')
      .reduce((sum, t) => sum + t.estimatedDuration, 0);
  };

  const isDateOverbooked = (date: Date): boolean => {
    return getScheduledMinutesForDate(date) > state.dailyCapacityMinutes;
  };

  const getDailyStats = (): DailyStats => {
    const today = getTodayISO();
    const todayTasks = state.tasks.filter((t) => t.dueDate && isToday(t.dueDate));
    const completedToday = todayTasks.filter((t) => t.status === 'completed').length;
    const habitsCompletedToday = state.habits.filter((h) =>
      h.completedDates.includes(today)
    ).length;

    // Calculate overall task streak
    let taskStreak = 0;
    let checkDate = startOfDay(new Date());
    while (true) {
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      const tasksOnDate = state.tasks.filter(
        (t) => t.dueDate && format(t.dueDate, 'yyyy-MM-dd') === dateStr
      );
      if (tasksOnDate.length === 0 || tasksOnDate.every((t) => t.status === 'completed')) {
        taskStreak++;
        checkDate = addDays(checkDate, -1);
        if (taskStreak > 365) break;
      } else {
        break;
      }
    }

    const scheduledMinutes = getScheduledMinutesForDate(new Date());

    return {
      tasksCompleted: completedToday,
      tasksDue: todayTasks.length,
      habitsCompleted: habitsCompletedToday,
      habitsTotal: state.habits.length,
      currentStreak: Math.max(taskStreak - 1, 0),
      productivityScore: calculateProductivityScore(
        completedToday,
        todayTasks.length,
        habitsCompletedToday,
        state.habits.length
      ),
      scheduledMinutes,
      availableMinutes: state.dailyCapacityMinutes,
      isOverbooked: scheduledMinutes > state.dailyCapacityMinutes,
    };
  };

  const getTodayTasks = () =>
    state.tasks.filter((t) => t.dueDate && isToday(t.dueDate) && t.status !== 'completed' && t.location === 'scheduled');

  const getUpcomingTasks = () =>
    state.tasks.filter(
      (t) =>
        t.dueDate &&
        isAfter(startOfDay(t.dueDate), startOfDay(new Date())) &&
        t.status !== 'completed' &&
        t.location === 'scheduled'
    );

  const getOverdueTasks = () =>
    state.tasks.filter(
      (t) =>
        t.dueDate &&
        isBefore(startOfDay(t.dueDate), startOfDay(new Date())) &&
        t.status !== 'completed' &&
        t.location === 'scheduled'
    );

  const getCompletedTasks = () =>
    state.tasks.filter((t) => t.status === 'completed');

  const getTasksByCategory = (category: string) =>
    state.tasks.filter((t) => t.category === category);

  const getInboxTasks = () =>
    state.tasks.filter((t) => t.location === 'inbox' && t.status !== 'completed');

  const getAgingTasks = () =>
    state.tasks.filter((t) => {
      if (!t.createdAt || t.status === 'completed') return false;
      const age = differenceInDays(new Date(), t.createdAt);
      return age >= state.taskAgingDays && !t.confirmedForToday;
    });

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        isLoading,
        isOnline,
        getDailyStats,
        getTodayTasks,
        getUpcomingTasks,
        getOverdueTasks,
        getCompletedTasks,
        getTasksByCategory,
        getInboxTasks,
        getAgingTasks,
        getScheduledMinutesForDate,
        isDateOverbooked,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
