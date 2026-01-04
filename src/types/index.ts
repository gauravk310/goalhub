export type GoalStatus = 'pending' | 'working' | 'done';
export type GoalPriority = 'low' | 'medium' | 'high';
export type GoalType = 'daily' | 'weekly' | 'monthly';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  categoryId: string;
  title: string;
  description: string;
  type: GoalType;
  status: GoalStatus;
  priority: GoalPriority;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
  token: string;
  expiresAt: string;
}

export interface GoalFilters {
  categoryId?: string;
  type?: GoalType;
  status?: GoalStatus;
  priority?: GoalPriority;
  search?: string;
}

export interface DashboardStats {
  totalGoals: number;
  statusDistribution: Record<GoalStatus, number>;
  priorityDistribution: Record<GoalPriority, number>;
  typeDistribution: Record<GoalType, number>;
  categoryDistribution: { name: string; count: number; color: string }[];
  completionRate: number;
  recentActivity: Goal[];
  highPriorityGoals: Goal[];
  yearlyChartData: { month: string; completed: number }[];
  totalCompletedThisYear: number;
  currentYear: number;
}
