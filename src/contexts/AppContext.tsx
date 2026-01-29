import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Task, TodoList, Habit, Category, DailyStats, TimeBlock } from '@/types';
import { generateId, getTodayISO, isToday, calculateProductivityScore } from '@/lib/utils';
import { addDays, format, isAfter, isBefore, startOfDay } from 'date-fns';

interface AppState {
  tasks: Task[];
  todoLists: TodoList[];
  habits: Habit[];
  categories: Category[];
  timeBlocks: TimeBlock[];
  focusMode: boolean;
  currentTaskId: string | null;
  theme: 'light' | 'dark';
}

type AppAction =
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'> }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'COMPLETE_TASK'; payload: string }
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
        streakFreezes: 3,
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
  getDailyStats: () => DailyStats;
  getTodayTasks: () => Task[];
  getUpcomingTasks: () => Task[];
  getOverdueTasks: () => Task[];
  getCompletedTasks: () => Task[];
  getTasksByCategory: (category: string) => Task[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('productivity-dashboard-state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Convert date strings back to Date objects
        const tasks = parsed.tasks?.map((t: any) => ({
          ...t,
          dueDate: new Date(t.dueDate),
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt),
          completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
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
        })) || [];
        dispatch({
          type: 'LOAD_STATE',
          payload: {
            ...initialState,
            ...parsed,
            tasks,
            todoLists,
            habits,
          },
        });
      } catch (e) {
        console.error('Failed to load state:', e);
      }
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('productivity-dashboard-state', JSON.stringify(state));
  }, [state]);

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
  }, [state.theme]);

  const getDailyStats = (): DailyStats => {
    const today = getTodayISO();
    const todayTasks = state.tasks.filter((t) => isToday(t.dueDate));
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
        (t) => format(t.dueDate, 'yyyy-MM-dd') === dateStr
      );
      if (tasksOnDate.length === 0 || tasksOnDate.every((t) => t.status === 'completed')) {
        taskStreak++;
        checkDate = addDays(checkDate, -1);
        if (taskStreak > 365) break;
      } else {
        break;
      }
    }

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
    };
  };

  const getTodayTasks = () =>
    state.tasks.filter((t) => isToday(t.dueDate) && t.status !== 'completed');

  const getUpcomingTasks = () =>
    state.tasks.filter(
      (t) =>
        isAfter(startOfDay(t.dueDate), startOfDay(new Date())) &&
        t.status !== 'completed'
    );

  const getOverdueTasks = () =>
    state.tasks.filter(
      (t) =>
        isBefore(startOfDay(t.dueDate), startOfDay(new Date())) &&
        t.status !== 'completed'
    );

  const getCompletedTasks = () =>
    state.tasks.filter((t) => t.status === 'completed');

  const getTasksByCategory = (category: string) =>
    state.tasks.filter((t) => t.category === category);

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        getDailyStats,
        getTodayTasks,
        getUpcomingTasks,
        getOverdueTasks,
        getCompletedTasks,
        getTasksByCategory,
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
