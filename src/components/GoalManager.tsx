import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Goal, Category, GoalFilters, GoalStatus, GoalPriority, GoalType } from '@/types';
import { getGoals, getCategories, createGoal, updateGoal, deleteGoal } from '@/lib/dataService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Target,
  Calendar,
  CalendarDays,
  CalendarRange,
  Clock,
  CheckCircle2,
  Circle,
  Filter,
  X,
} from 'lucide-react';

const STATUS_CONFIG: Record<GoalStatus, { label: string; icon: React.ReactNode; className: string }> = {
  pending: {
    label: 'Pending',
    icon: <Circle className="h-4 w-4" />,
    className: 'bg-status-pending-bg text-status-pending border-status-pending/20',
  },
  working: {
    label: 'Working',
    icon: <Clock className="h-4 w-4" />,
    className: 'bg-status-working-bg text-status-working border-status-working/20',
  },
  done: {
    label: 'Done',
    icon: <CheckCircle2 className="h-4 w-4" />,
    className: 'bg-status-done-bg text-status-done border-status-done/20',
  },
};

const PRIORITY_CONFIG: Record<GoalPriority, { label: string; className: string }> = {
  low: {
    label: 'Low',
    className: 'bg-priority-low-bg text-priority-low border-priority-low/20',
  },
  medium: {
    label: 'Medium',
    className: 'bg-priority-medium-bg text-priority-medium border-priority-medium/20',
  },
  high: {
    label: 'High',
    className: 'bg-priority-high-bg text-priority-high border-priority-high/20',
  },
};

const TYPE_CONFIG: Record<GoalType, { label: string; icon: React.ReactNode; className: string }> = {
  daily: {
    label: 'Daily',
    icon: <Calendar className="h-4 w-4" />,
    className: 'bg-goal-daily-bg text-goal-daily border-goal-daily/20',
  },
  weekly: {
    label: 'Weekly',
    icon: <CalendarDays className="h-4 w-4" />,
    className: 'bg-goal-weekly-bg text-goal-weekly border-goal-weekly/20',
  },
  monthly: {
    label: 'Monthly',
    icon: <CalendarRange className="h-4 w-4" />,
    className: 'bg-goal-monthly-bg text-goal-monthly border-goal-monthly/20',
  },
};

interface GoalManagerProps {
  refreshTrigger?: number;
}

const GoalManager: React.FC<GoalManagerProps> = ({ refreshTrigger }) => {
  const { session } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<GoalFilters>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    type: 'daily' as GoalType,
    priority: 'medium' as GoalPriority,
    status: 'pending' as GoalStatus,
  });

  const loadData = async () => {
    if (session) {
      try {
        const [userGoals, userCats] = await Promise.all([
          getGoals(session.userId),
          getCategories(session.userId),
        ]);
        setGoals(userGoals);
        setCategories(userCats);
      } catch (error) {
        console.error('Failed to load data', error);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [session, refreshTrigger]);

  const filteredGoals = useMemo(() => {
    return goals.filter((goal) => {
      if (filters.categoryId && goal.categoryId !== filters.categoryId) return false;
      if (filters.type && goal.type !== filters.type) return false;
      if (filters.status && goal.status !== filters.status) return false;
      if (filters.priority && goal.priority !== filters.priority) return false;
      if (filters.search) {
        const search = filters.search.toLowerCase();
        return (
          goal.title.toLowerCase().includes(search) ||
          goal.description.toLowerCase().includes(search)
        );
      }
      return true;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [goals, filters]);

  const getCategoryById = (id: string) => categories.find((c) => c.id === id);

  const handleOpenCreate = () => {
    setSelectedGoal(null);
    setFormData({
      title: '',
      description: '',
      categoryId: categories[0]?.id || '',
      type: 'daily',
      priority: 'medium',
      status: 'pending',
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (goal: Goal) => {
    setSelectedGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description,
      categoryId: goal.categoryId,
      type: goal.type,
      priority: goal.priority,
      status: goal.status,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Please enter a goal title');
      return;
    }

    if (!formData.categoryId) {
      toast.error('Please select a category');
      return;
    }

    try {
      if (selectedGoal) {
        await updateGoal(selectedGoal.id, formData);
        toast.success('Goal updated');
      } else if (session) {
        await createGoal(
          session.userId,
          formData.categoryId,
          formData.title,
          formData.description,
          formData.type,
          formData.priority
        );
        toast.success('Goal created');
      }

      loadData();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save goal');
    }
  };

  const handleStatusChange = async (goal: Goal, status: GoalStatus) => {
    try {
      await updateGoal(goal.id, { status });
      loadData();
      toast.success(`Goal marked as ${status}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (selectedGoal) {
      try {
        await deleteGoal(selectedGoal.id);
        toast.success('Goal deleted');
        loadData();
        setIsDeleteDialogOpen(false);
        setSelectedGoal(null);
      } catch (error) {
        toast.error('Failed to delete goal');
      }
    }
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.values(filters).some((v) => v);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Target className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Goals</h2>
          <Badge variant="secondary" className="ml-2">
            {filteredGoals.length}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={hasActiveFilters ? 'border-primary' : ''}
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
            {hasActiveFilters && (
              <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                {Object.values(filters).filter((v) => v).length}
              </Badge>
            )}
          </Button>
          <Button onClick={handleOpenCreate} disabled={categories.length === 0}>
            <Plus className="h-4 w-4 mr-1" />
            Add Goal
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-4 bg-card rounded-lg border border-border animate-slide-down">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-foreground">Filter Goals</h3>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search goals..."
                value={filters.search || ''}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
            <Select
              value={filters.categoryId || 'all'}
              onValueChange={(v) => setFilters((prev) => ({ ...prev, categoryId: v === 'all' ? undefined : v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.type || 'all'}
              onValueChange={(v) => setFilters((prev) => ({ ...prev, type: v === 'all' ? undefined : (v as GoalType) }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.status || 'all'}
              onValueChange={(v) => setFilters((prev) => ({ ...prev, status: v === 'all' ? undefined : (v as GoalStatus) }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="working">Working</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.priority || 'all'}
              onValueChange={(v) => setFilters((prev) => ({ ...prev, priority: v === 'all' ? undefined : (v as GoalPriority) }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Goals List */}
      {categories.length === 0 ? (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No categories yet</h3>
          <p className="text-muted-foreground">Create a category first to start adding goals.</p>
        </div>
      ) : filteredGoals.length === 0 ? (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No goals found</h3>
          <p className="text-muted-foreground">
            {hasActiveFilters ? 'Try adjusting your filters.' : 'Create your first goal to get started!'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredGoals.map((goal) => {
            const category = getCategoryById(goal.categoryId);
            return (
              <div
                key={goal.id}
                className="p-4 bg-card rounded-lg border border-border hover:shadow-md transition-all animate-fade-in"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Link href={`/goals/${goal.id}`} className="block min-w-0 flex-1 hover:underline">
                        <h3 className="font-semibold text-foreground truncate">{goal.title}</h3>
                      </Link>
                      {category && (
                        <Badge
                          variant="outline"
                          className="text-xs"
                          style={{ borderColor: category.color, color: category.color }}
                        >
                          {category.name}
                        </Badge>
                      )}
                    </div>
                    {goal.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {goal.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className={TYPE_CONFIG[goal.type].className}>
                        {TYPE_CONFIG[goal.type].icon}
                        <span className="ml-1">{TYPE_CONFIG[goal.type].label}</span>
                      </Badge>
                      <Badge variant="outline" className={PRIORITY_CONFIG[goal.priority].className}>
                        {PRIORITY_CONFIG[goal.priority].label}
                      </Badge>
                      <Badge variant="outline" className={STATUS_CONFIG[goal.status].className}>
                        {STATUS_CONFIG[goal.status].icon}
                        <span className="ml-1">{STATUS_CONFIG[goal.status].label}</span>
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={goal.status}
                      onValueChange={(v) => handleStatusChange(goal, v as GoalStatus)}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="working">Working</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedGoal ? 'Edit Goal' : 'New Goal'}</DialogTitle>
            <DialogDescription>
              {selectedGoal ? 'Update the goal details below.' : 'Create a new goal to track your progress.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Complete project report"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Add more details about your goal..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(v) => setFormData((prev) => ({ ...prev, categoryId: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                            {cat.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v) => setFormData((prev) => ({ ...prev, type: v as GoalType }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(v) => setFormData((prev) => ({ ...prev, priority: v as GoalPriority }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {selectedGoal && (
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(v) => setFormData((prev) => ({ ...prev, status: v as GoalStatus }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="working">Working</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{selectedGoal ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Goal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedGoal?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GoalManager;
