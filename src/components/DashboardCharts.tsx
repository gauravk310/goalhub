import React, { useMemo } from 'react';
import { Goal, Category, DashboardStats, GoalStatus, GoalPriority, GoalType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Target,
  TrendingUp,
  CheckCircle2,
  Clock,
  Circle,
  Calendar,
  CalendarDays,
  CalendarRange,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import ContributionHeatmap from './ContributionHeatmap';

interface DashboardChartsProps {
  goals: Goal[];
  categories: Category[];
}

const STATUS_COLORS: Record<GoalStatus, string> = {
  pending: 'hsl(220, 9%, 46%)',
  working: 'hsl(38, 92%, 50%)',
  done: 'hsl(142, 71%, 45%)',
};

const PRIORITY_COLORS: Record<GoalPriority, string> = {
  low: 'hsl(199, 89%, 48%)',
  medium: 'hsl(25, 95%, 53%)',
  high: 'hsl(346, 77%, 50%)',
};

const TYPE_COLORS: Record<GoalType, string> = {
  daily: 'hsl(262, 83%, 58%)',
  weekly: 'hsl(199, 89%, 48%)',
  monthly: 'hsl(142, 71%, 45%)',
};

const DashboardCharts: React.FC<DashboardChartsProps> = ({ goals, categories }) => {
  const stats = useMemo<DashboardStats>(() => {
    const statusDistribution: Record<GoalStatus, number> = {
      pending: 0,
      working: 0,
      done: 0,
    };

    const priorityDistribution: Record<GoalPriority, number> = {
      low: 0,
      medium: 0,
      high: 0,
    };

    const typeDistribution: Record<GoalType, number> = {
      daily: 0,
      weekly: 0,
      monthly: 0,
    };

    const categoryCount: Record<string, number> = {};

    goals.forEach((goal) => {
      statusDistribution[goal.status]++;
      priorityDistribution[goal.priority]++;
      typeDistribution[goal.type]++;
      categoryCount[goal.categoryId] = (categoryCount[goal.categoryId] || 0) + 1;
    });

    const categoryDistribution = categories.map((cat) => ({
      name: cat.name,
      count: categoryCount[cat.id] || 0,
      color: cat.color,
    })).filter(c => c.count > 0);

    const completionRate = goals.length > 0
      ? Math.round((statusDistribution.done / goals.length) * 100)
      : 0;

    const recentActivity = [...goals]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);

    // High Priority Tasks (active goals with high priority)
    const highPriorityGoals = goals
      .filter(g => g.priority === 'high' && g.status !== 'done')
      .slice(0, 4);

    // Yearly Chart Data (current year)
    const currentYear = new Date().getFullYear();
    const completedGoalsThisYear = goals.filter(g => {
      const d = new Date(g.updatedAt);
      return g.status === 'done' && d.getFullYear() === currentYear;
    });

    const monthlyCompletions = new Array(12).fill(0);
    completedGoalsThisYear.forEach(g => {
      const d = new Date(g.updatedAt);
      monthlyCompletions[d.getMonth()]++;
    });

    const yearlyChartData = monthlyCompletions.map((count, index) => ({
      month: new Date(0, index).toLocaleString('default', { month: 'short' }),
      completed: count
    }));

    return {
      totalGoals: goals.length,
      statusDistribution,
      priorityDistribution,
      typeDistribution,
      categoryDistribution,
      completionRate,
      recentActivity,
      highPriorityGoals,
      yearlyChartData,
      totalCompletedThisYear: completedGoalsThisYear.length,
      currentYear
    };
  }, [goals, categories]);

  const statusChartData = [
    { name: 'Pending', value: stats.statusDistribution.pending, color: STATUS_COLORS.pending },
    { name: 'Working', value: stats.statusDistribution.working, color: STATUS_COLORS.working },
    { name: 'Done', value: stats.statusDistribution.done, color: STATUS_COLORS.done },
  ].filter(d => d.value > 0);

  const priorityChartData = [
    { name: 'Low', value: stats.priorityDistribution.low, color: PRIORITY_COLORS.low },
    { name: 'Medium', value: stats.priorityDistribution.medium, color: PRIORITY_COLORS.medium },
    { name: 'High', value: stats.priorityDistribution.high, color: PRIORITY_COLORS.high },
  ].filter(d => d.value > 0);

  const typeChartData = [
    { name: 'Daily', value: stats.typeDistribution.daily, color: TYPE_COLORS.daily },
    { name: 'Weekly', value: stats.typeDistribution.weekly, color: TYPE_COLORS.weekly },
    { name: 'Monthly', value: stats.typeDistribution.monthly, color: TYPE_COLORS.monthly },
  ].filter(d => d.value > 0);

  const categoryChartData = stats.categoryDistribution.map(c => ({
    name: c.name,
    goals: c.count,
    fill: c.color,
  }));

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Unknown';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (goals.length === 0) {
    return (
      <div className="text-center py-12">
        <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">No data yet</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Start creating goals to see your performance analytics and track your progress.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contribution Heatmap */}
      <ContributionHeatmap goals={goals} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="animate-fade-in">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Goals</p>
                <p className="text-3xl font-bold text-foreground">{stats.totalGoals}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <Target className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '50ms' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-3xl font-bold text-foreground">{stats.completionRate}%</p>
              </div>
              <div className={`p-3 rounded-full ${stats.completionRate >= 50 ? 'bg-status-done-bg' : 'bg-status-working-bg'}`}>
                {stats.completionRate >= 50 ? (
                  <ArrowUpRight className="h-6 w-6 text-status-done" />
                ) : (
                  <ArrowDownRight className="h-6 w-6 text-status-working" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-3xl font-bold text-foreground">{stats.statusDistribution.working}</p>
              </div>
              <div className="p-3 bg-status-working-bg rounded-full">
                <Clock className="h-6 w-6 text-status-working" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '150ms' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold text-foreground">{stats.statusDistribution.done}</p>
              </div>
              <div className="p-3 bg-status-done-bg rounded-full">
                <CheckCircle2 className="h-6 w-6 text-status-done" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* High Priority Tasks & Yearly Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* High Priority Tasks */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-destructive" />
              High Priority Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.highPriorityGoals.length > 0 ? (
              <div className="space-y-4">
                {stats.highPriorityGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="flex items-center justify-between p-3 bg-destructive/10 border border-destructive/20 rounded-lg hover:bg-destructive/15 transition-colors cursor-pointer group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate group-hover:text-destructive transition-colors">
                        {goal.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="bg-background text-xs">
                          {getCategoryName(goal.categoryId)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {goal.type}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* You can add actions here if needed */}
                      <ArrowUpRight className="h-4 w-4 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground text-center p-4">
                <CheckCircle2 className="h-8 w-8 mb-2 opacity-50" />
                <p>No high priority tasks pending!</p>
                <p className="text-sm opacity-70">Great job staying on top of things.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Yearly Goal Chart */}
        <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {stats.totalCompletedThisYear} Goals Completed in {stats.currentYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.yearlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))'
                    }}
                    cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ r: 4, fill: 'hsl(var(--background))', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No data
              </div>
            )}
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Priority Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {priorityChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={priorityChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {priorityChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No data
              </div>
            )}
          </CardContent>
        </Card>

        {/* Goal Types */}
        <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Goal Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            {typeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={typeChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {typeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No data
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Bar Chart */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="text-lg">Goals by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={categoryChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="goals" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No categories with goals
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivity.map((goal) => (
                  <div
                    key={goal.id}
                    className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{goal.title}</p>
                      <p className="text-sm text-muted-foreground">{getCategoryName(goal.categoryId)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          goal.status === 'done'
                            ? 'bg-status-done-bg text-status-done'
                            : goal.status === 'working'
                              ? 'bg-status-working-bg text-status-working'
                              : 'bg-status-pending-bg text-status-pending'
                        }
                      >
                        {goal.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(goal.updatedAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No recent activity
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div >
  );
};

export default DashboardCharts;
