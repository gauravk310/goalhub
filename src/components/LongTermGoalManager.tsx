
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LongTermGoal, LongTermGoalStatus } from '@/types';
import { getLongTermGoals, createLongTermGoal, updateLongTermGoal, deleteLongTermGoal } from '@/lib/dataService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import {
    Plus,
    Target,
    CheckCircle2,
    Circle,
    Trash2,
    Pencil,
    MoreVertical
} from 'lucide-react';

const STATUS_CONFIG: Record<LongTermGoalStatus, { label: string; icon: React.ReactNode; className: string }> = {
    incomplete: {
        label: 'Incomplete',
        icon: <Circle className="h-4 w-4" />,
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
    },
    complete: {
        label: 'Complete',
        icon: <CheckCircle2 className="h-4 w-4" />,
        className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
    },
};

interface LongTermGoalManagerProps {
    refreshTrigger?: number;
}

const LongTermGoalManager: React.FC<LongTermGoalManagerProps> = ({ refreshTrigger }) => {
    const { session } = useAuth();
    const [goals, setGoals] = useState<LongTermGoal[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<LongTermGoal | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'incomplete' as LongTermGoalStatus,
    });

    const loadData = async () => {
        if (session) {
            try {
                const userGoals = await getLongTermGoals(session.userId);
                setGoals(userGoals);
            } catch (error) {
                console.error('Failed to load data', error);
            }
        }
    };

    useEffect(() => {
        loadData();
    }, [session, refreshTrigger]);

    const handleOpenCreate = () => {
        setSelectedGoal(null);
        setFormData({
            title: '',
            description: '',
            status: 'incomplete',
        });
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (goal: LongTermGoal) => {
        setSelectedGoal(goal);
        setFormData({
            title: goal.title,
            description: goal.description || '',
            status: goal.status,
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error('Please enter a title');
            return;
        }

        try {
            if (selectedGoal) {
                await updateLongTermGoal(selectedGoal.id, formData);
                toast.success('Long-term goal updated');
            } else if (session) {
                await createLongTermGoal(
                    session.userId,
                    formData.title,
                    formData.description,
                    formData.status
                );
                toast.success('Long-term goal created');
            }

            loadData();
            setIsDialogOpen(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to save goal');
        }
    };

    const handleDelete = async () => {
        if (selectedGoal) {
            try {
                await deleteLongTermGoal(selectedGoal.id);
                toast.success('Goal deleted');
                loadData();
                setIsDeleteDialogOpen(false);
                setSelectedGoal(null);
            } catch (error) {
                toast.error('Failed to delete goal');
            }
        }
    };

    const toggleStatus = async (goal: LongTermGoal) => {
        try {
            const newStatus = goal.status === 'complete' ? 'incomplete' : 'complete';
            await updateLongTermGoal(goal.id, { status: newStatus });
            loadData();
            toast.success(`Goal marked as ${newStatus}`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-card p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Long-Term Goals</h3>
                </div>
                <Button onClick={handleOpenCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Goal
                </Button>
            </div>

            {goals.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-lg border border-border border-dashed">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No long-term goals yet</h3>
                    <p className="text-muted-foreground">Define your long-term vision and start tracking!</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {goals.map((goal) => (
                        <div
                            key={goal.id}
                            className="p-4 bg-card rounded-lg border border-border hover:shadow-md transition-all animate-fade-in group"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3 flex-1">
                                    <button
                                        onClick={() => toggleStatus(goal)}
                                        className={`mt-1 flex-shrink-0 rounded-full w-5 h-5 border flex items-center justify-center transition-colors ${goal.status === 'complete'
                                            ? 'bg-primary border-primary text-primary-foreground'
                                            : 'border-muted-foreground hover:border-primary'
                                            }`}
                                    >
                                        {goal.status === 'complete' && <CheckCircle2 className="h-3.5 w-3.5" />}
                                    </button>
                                    <div className="space-y-1">
                                        <h3 className={`font-semibold text-foreground ${goal.status === 'complete' ? 'line-through text-muted-foreground' : ''}`}>
                                            {goal.title}
                                        </h3>
                                        {goal.description && (
                                            <p className="text-sm text-muted-foreground">{goal.description}</p>
                                        )}
                                        <Badge variant="outline" className={`mt-2 ${STATUS_CONFIG[goal.status].className}`}>
                                            {STATUS_CONFIG[goal.status].label}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleOpenEdit(goal)}>
                                                <Pencil className="h-4 w-4 mr-2" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    setSelectedGoal(goal);
                                                    setIsDeleteDialogOpen(true);
                                                }}
                                                className="text-destructive focus:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedGoal ? 'Edit Long-Term Goal' : 'New Long-Term Goal'}</DialogTitle>
                        <DialogDescription>
                            Define a significant objective you want to achieve.
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
                                    placeholder="e.g., Buy a House, Learn a Language"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                    placeholder="Add more details..."
                                />
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

            {/* Delete Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Goal</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this long-term goal? This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default LongTermGoalManager;
