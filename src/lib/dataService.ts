
import { User, Category, Goal, AuthSession, GoalProgress, Learning, LearningProgress } from '@/types';

const STORAGE_KEYS = {
  SESSION: 'goaltracker_session',
};

// Session Management (Client Side)
const getStorageItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setStorageItem = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Storage error:', error);
  }
};

export const getSession = (): AuthSession | null => {
  const session = getStorageItem<AuthSession | null>(STORAGE_KEYS.SESSION, null);

  if (session && new Date(session.expiresAt) < new Date()) {
    if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEYS.SESSION);
    return null;
  }

  return session;
};

export const clearSession = (): void => {
  if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEYS.SESSION);
};

// API Helper
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const session = getSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (session?.token) {
    headers['Authorization'] = `Bearer ${session.token}`;
  }

  const res = await fetch(url, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'An error occurred');
  }

  return data;
}

// Auth Types - matching what frontend expects (roughly)
export const createUser = async (email: string, password: string, name: string): Promise<User> => {
  return await fetchWithAuth('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
};

export const authenticateUser = async (email: string, password: string): Promise<AuthSession> => {
  const session = await fetchWithAuth('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  setStorageItem(STORAGE_KEYS.SESSION, session);
  return session;
};

// Categories
export const getCategories = async (userId: string): Promise<Category[]> => {
  return await fetchWithAuth('/api/categories');
};

export const createCategory = async (userId: string, name: string, color: string, icon?: string): Promise<Category> => {
  return await fetchWithAuth('/api/categories', {
    method: 'POST',
    body: JSON.stringify({ name, color, icon }),
  });
};

export const updateCategory = async (categoryId: string, updates: Partial<Category>): Promise<Category> => {
  return await fetchWithAuth(`/api/categories/${categoryId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
};

export const deleteCategory = async (categoryId: string): Promise<void> => {
  await fetchWithAuth(`/api/categories/${categoryId}`, {
    method: 'DELETE',
  });
};

// Goals
export const getGoals = async (userId: string): Promise<Goal[]> => {
  return await fetchWithAuth('/api/goals');
};

export const createGoal = async (
  userId: string,
  categoryId: string,
  title: string,
  description: string,
  type: Goal['type'],
  priority: Goal['priority']
): Promise<Goal> => {
  return await fetchWithAuth('/api/goals', {
    method: 'POST',
    body: JSON.stringify({ userId, categoryId, title, description, type, priority }),
  });
};

export const updateGoal = async (goalId: string, updates: Partial<Goal>): Promise<Goal> => {
  return await fetchWithAuth(`/api/goals/${goalId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
};

export const deleteGoal = async (goalId: string): Promise<void> => {
  await fetchWithAuth(`/api/goals/${goalId}`, {
    method: 'DELETE',
  });
};

// Deprecated or Unused in new model
export const initializeUserData = async (userId: string): Promise<void> => {
  // handled by backend on register
};

// Learning
export const getLearnings = async (userId: string): Promise<Learning[]> => {
  return await fetchWithAuth('/api/learnings');
};

export const createLearning = async (
  userId: string,
  categoryId: string,
  title: string,
  description: string,
  status: Learning['status'],
  dueDate?: string
): Promise<Learning> => {
  return await fetchWithAuth('/api/learnings', {
    method: 'POST',
    body: JSON.stringify({ userId, categoryId, title, description, status, dueDate }),
  });
};

export const updateLearning = async (learningId: string, updates: Partial<Learning>): Promise<Learning> => {
  return await fetchWithAuth(`/api/learnings/${learningId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
};

export const deleteLearning = async (learningId: string): Promise<void> => {
  await fetchWithAuth(`/api/learnings/${learningId}`, {
    method: 'DELETE',
  });
};

export const getLearningProgress = async (learningId: string): Promise<LearningProgress[]> => {
  return await fetchWithAuth(`/api/learnings/${learningId}/progress`);
};

export const createLearningProgress = async (learningId: string, title: string, description: string): Promise<LearningProgress> => {
  return await fetchWithAuth(`/api/learnings/${learningId}/progress`, {
    method: 'POST',
    body: JSON.stringify({ title, description }),
  });
};


export const generateId = () => ''; // Stub

export const getAllProgress = async (userId: string): Promise<GoalProgress[]> => {
  return await fetchWithAuth('/api/progress');
};

