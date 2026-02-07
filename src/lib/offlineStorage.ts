import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Task, TodoList, Habit, Category, FixedCommitment, TimeBlock } from '@/types';

interface ProductivityDB extends DBSchema {
  tasks: {
    key: string;
    value: Task;
    indexes: { 'by-location': string; 'by-status': string };
  };
  todoLists: {
    key: string;
    value: TodoList;
  };
  habits: {
    key: string;
    value: Habit;
  };
  categories: {
    key: string;
    value: Category;
  };
  timeBlocks: {
    key: string;
    value: TimeBlock;
  };
  fixedCommitments: {
    key: string;
    value: FixedCommitment;
  };
  syncQueue: {
    key: string;
    value: SyncQueueItem;
    indexes: { 'by-timestamp': number };
  };
  metadata: {
    key: string;
    value: MetadataItem;
  };
}

export interface SyncQueueItem {
  id: string;
  type: 'task' | 'todoList' | 'habit' | 'category' | 'timeBlock' | 'fixedCommitment';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retries: number;
}

interface MetadataItem {
  key: string;
  value: any;
}

const DB_NAME = 'productivity-dashboard';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<ProductivityDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<ProductivityDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<ProductivityDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Tasks store
      if (!db.objectStoreNames.contains('tasks')) {
        const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
        taskStore.createIndex('by-location', 'location');
        taskStore.createIndex('by-status', 'status');
      }

      // Todo lists store
      if (!db.objectStoreNames.contains('todoLists')) {
        db.createObjectStore('todoLists', { keyPath: 'id' });
      }

      // Habits store
      if (!db.objectStoreNames.contains('habits')) {
        db.createObjectStore('habits', { keyPath: 'id' });
      }

      // Categories store
      if (!db.objectStoreNames.contains('categories')) {
        db.createObjectStore('categories', { keyPath: 'id' });
      }

      // Time blocks store
      if (!db.objectStoreNames.contains('timeBlocks')) {
        db.createObjectStore('timeBlocks', { keyPath: 'id' });
      }

      // Fixed commitments store
      if (!db.objectStoreNames.contains('fixedCommitments')) {
        db.createObjectStore('fixedCommitments', { keyPath: 'id' });
      }

      // Sync queue store
      if (!db.objectStoreNames.contains('syncQueue')) {
        const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
        syncStore.createIndex('by-timestamp', 'timestamp');
      }

      // Metadata store for settings
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata', { keyPath: 'key' });
      }
    },
  });

  return dbInstance;
}

// Task operations
export async function saveTasks(tasks: Task[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('tasks', 'readwrite');
  await Promise.all([
    ...tasks.map((task) => tx.store.put(task)),
    tx.done,
  ]);
}

export async function getTasks(): Promise<Task[]> {
  const db = await getDB();
  const tasks = await db.getAll('tasks');
  return tasks.map(convertDates);
}

export async function saveTask(task: Task): Promise<void> {
  const db = await getDB();
  await db.put('tasks', task);
}

export async function deleteTask(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('tasks', id);
}

// TodoList operations
export async function saveTodoLists(lists: TodoList[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('todoLists', 'readwrite');
  await Promise.all([...lists.map((list) => tx.store.put(list)), tx.done]);
}

export async function getTodoLists(): Promise<TodoList[]> {
  const db = await getDB();
  const lists = await db.getAll('todoLists');
  return lists.map((list) => ({
    ...list,
    createdAt: new Date(list.createdAt),
    items: list.items?.map((item) => ({
      ...item,
      createdAt: new Date(item.createdAt),
      completedAt: item.completedAt ? new Date(item.completedAt) : undefined,
    })) || [],
  }));
}

// Habit operations
export async function saveHabits(habits: Habit[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('habits', 'readwrite');
  await Promise.all([...habits.map((habit) => tx.store.put(habit)), tx.done]);
}

export async function getHabits(): Promise<Habit[]> {
  const db = await getDB();
  const habits = await db.getAll('habits');
  return habits.map((habit) => ({
    ...habit,
    startDate: new Date(habit.startDate),
    createdAt: new Date(habit.createdAt),
  }));
}

// Category operations
export async function saveCategories(categories: Category[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('categories', 'readwrite');
  await Promise.all([...categories.map((cat) => tx.store.put(cat)), tx.done]);
}

export async function getCategories(): Promise<Category[]> {
  const db = await getDB();
  return db.getAll('categories');
}

// TimeBlock operations
export async function saveTimeBlocks(blocks: TimeBlock[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('timeBlocks', 'readwrite');
  await Promise.all([...blocks.map((block) => tx.store.put(block)), tx.done]);
}

export async function getTimeBlocks(): Promise<TimeBlock[]> {
  const db = await getDB();
  return db.getAll('timeBlocks');
}

// Fixed commitments operations
export async function saveFixedCommitments(commitments: FixedCommitment[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('fixedCommitments', 'readwrite');
  await Promise.all([...commitments.map((c) => tx.store.put(c)), tx.done]);
}

export async function getFixedCommitments(): Promise<FixedCommitment[]> {
  const db = await getDB();
  return db.getAll('fixedCommitments');
}

// Metadata operations
export async function saveMetadata(key: string, value: any): Promise<void> {
  const db = await getDB();
  await db.put('metadata', { key, value });
}

export async function getMetadata(key: string): Promise<any> {
  const db = await getDB();
  const item = await db.get('metadata', key);
  return item?.value;
}

// Sync queue operations
export async function addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retries'>): Promise<void> {
  const db = await getDB();
  const syncItem: SyncQueueItem = {
    ...item,
    id: `${item.type}-${item.action}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    retries: 0,
  };
  await db.put('syncQueue', syncItem);
}

export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  const db = await getDB();
  return db.getAllFromIndex('syncQueue', 'by-timestamp');
}

export async function removeSyncQueueItem(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('syncQueue', id);
}

export async function updateSyncQueueItem(item: SyncQueueItem): Promise<void> {
  const db = await getDB();
  await db.put('syncQueue', item);
}

export async function clearSyncQueue(): Promise<void> {
  const db = await getDB();
  await db.clear('syncQueue');
}

export async function getSyncQueueCount(): Promise<number> {
  const db = await getDB();
  return db.count('syncQueue');
}

// Helper to convert date strings back to Date objects
function convertDates(task: any): Task {
  return {
    ...task,
    dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
    createdAt: new Date(task.createdAt),
    updatedAt: new Date(task.updatedAt),
    completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
    originalDueDate: task.originalDueDate ? new Date(task.originalDueDate) : undefined,
  };
}

// Bulk load all data
export async function loadAllData(): Promise<{
  tasks: Task[];
  todoLists: TodoList[];
  habits: Habit[];
  categories: Category[];
  timeBlocks: TimeBlock[];
  fixedCommitments: FixedCommitment[];
  metadata: Record<string, any>;
}> {
  const [tasks, todoLists, habits, categories, timeBlocks, fixedCommitments] = await Promise.all([
    getTasks(),
    getTodoLists(),
    getHabits(),
    getCategories(),
    getTimeBlocks(),
    getFixedCommitments(),
  ]);

  const db = await getDB();
  const metadataItems = await db.getAll('metadata');
  const metadata = metadataItems.reduce((acc, item) => {
    acc[item.key] = item.value;
    return acc;
  }, {} as Record<string, any>);

  return { tasks, todoLists, habits, categories, timeBlocks, fixedCommitments, metadata };
}

// Bulk save all data
export async function saveAllData(data: {
  tasks: Task[];
  todoLists: TodoList[];
  habits: Habit[];
  categories: Category[];
  timeBlocks: TimeBlock[];
  fixedCommitments: FixedCommitment[];
  metadata?: Record<string, any>;
}): Promise<void> {
  await Promise.all([
    saveTasks(data.tasks),
    saveTodoLists(data.todoLists),
    saveHabits(data.habits),
    saveCategories(data.categories),
    saveTimeBlocks(data.timeBlocks),
    saveFixedCommitments(data.fixedCommitments),
    ...(data.metadata
      ? Object.entries(data.metadata).map(([key, value]) => saveMetadata(key, value))
      : []),
  ]);
}
