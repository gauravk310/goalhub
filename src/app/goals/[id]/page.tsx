"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Goal, GoalProgress, Category, GoalType, GoalPriority, GoalStatus } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import {
    FileText,
    History,
    CheckCircle,
    Plus,
    GitCommit,
    Search,
    BookOpen,
    CircleDot,
    Settings,
    Pencil,
    Trash2,
    RotateCcw,
    Loader2,
    Target,
    LogOut,
    User
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

export default function GoalDetailPage() {
    const { id } = useParams();
    const { session, logout } = useAuth();
    const router = useRouter();

    const [goal, setGoal] = useState<Goal | null>(null);
    const [progressList, setProgressList] = useState<GoalProgress[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // Progress State
    const [isAddingProgress, setIsAddingProgress] = useState(false);
    const [newProgressTitle, setNewProgressTitle] = useState('');
    const [newProgressDesc, setNewProgressDesc] = useState('');
    const [submittingProgress, setSubmittingProgress] = useState(false);

    // Edit/Delete State
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [editFormData, setEditFormData] = useState({
        title: '',
        description: '',
        categoryId: '',
        type: 'daily' as GoalType,
        priority: 'medium' as GoalPriority,
        status: 'pending' as GoalStatus,
    });
    const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
    const [isMarkingComplete, setIsMarkingComplete] = useState(false);
    const [isReworkDialogOpen, setIsReworkDialogOpen] = useState(false);
    const [isReworking, setIsReworking] = useState(false);
    const [submittingEdit, setSubmittingEdit] = useState(false);

    // ... useEffect ...

    // ... confirmMarkCompleted ...

    const confirmRework = async () => {
        if (!goal || !session?.token) return;

        setIsReworking(true);
        const previousStatus = goal.status;
        setGoal({ ...goal, status: 'working' });
        setEditFormData(prev => ({ ...prev, status: 'working' }));
        // Don't close immediately to show state change if needed, but for UX usually close after success
        // or keep open with loader. Let's keep open with loader until success?
        // Actually, user wants "loader everywhere".

        try {
            const res = await fetch(`/api/goals/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.token}`
                },
                body: JSON.stringify({ status: 'working' })
            });
            if (!res.ok) {
                setGoal({ ...goal, status: previousStatus });
                setEditFormData(prev => ({ ...prev, status: previousStatus }));
                toast.error('Failed to update status');
            } else {
                toast.success('Goal reopened for work!');
                setIsReworkDialogOpen(false); // Close on success
            }
        } catch (error) {
            setGoal({ ...goal, status: previousStatus });
            setEditFormData(prev => ({ ...prev, status: previousStatus }));
            toast.error('Failed to update status');
        } finally {
            setIsReworking(false);
        }
    };

    const handleAddProgress = async () => {
        if (!newProgressTitle.trim() || !session?.token) return;
        setSubmittingProgress(true);
        try {
            const res = await fetch(`/api/goals/${id}/progress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.token}`
                },
                body: JSON.stringify({
                    title: newProgressTitle,
                    description: newProgressDesc
                })
            });

            if (res.ok) {
                const newProgress = await res.json();
                setProgressList([newProgress, ...progressList]);
                setNewProgressTitle('');
                setNewProgressDesc('');
                setIsAddingProgress(false);
                toast.success('Progress added!');
            } else {
                toast.error('Failed to add progress');
            }
        } catch (error) {
            console.error("Failed to add progress", error);
            toast.error('Failed to add progress');
        } finally {
            setSubmittingProgress(false);
        }
    };

    const confirmMarkCompleted = async () => {
        if (!goal || !session?.token) return;

        setIsMarkingComplete(true);
        const previousStatus = goal.status;
        setGoal({ ...goal, status: 'done' });
        setEditFormData(prev => ({ ...prev, status: 'done' }));

        try {
            const res = await fetch(`/api/goals/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.token}`
                },
                body: JSON.stringify({ status: 'done' })
            });
            if (!res.ok) {
                setGoal({ ...goal, status: previousStatus });
                setEditFormData(prev => ({ ...prev, status: previousStatus }));
                toast.error('Failed to update status');
            } else {
                toast.success('Goal marked as completed!');
                setIsCompleteDialogOpen(false); // Close on success
            }
        } catch (error) {
            setGoal({ ...goal, status: previousStatus });
            setEditFormData(prev => ({ ...prev, status: previousStatus }));
            toast.error('Failed to update status');
        } finally {
            setIsMarkingComplete(false);
        }
    };

    useEffect(() => {
        if (!session?.token) return;

        const fetchData = async () => {
            try {
                // Fetch Goal
                const goalRes = await fetch(`/api/goals/${id}`, {
                    headers: { 'Authorization': `Bearer ${session.token}` }
                });

                if (!goalRes.ok) {
                    if (goalRes.status === 404) router.push('/dashboard');
                    return;
                }
                const goalData = await goalRes.json();
                setGoal(goalData);
                // Initialize edit form data
                setEditFormData({
                    title: goalData.title,
                    description: goalData.description,
                    categoryId: goalData.categoryId,
                    type: goalData.type,
                    priority: goalData.priority,
                    status: goalData.status,
                });

                // Fetch Categories
                const catRes = await fetch(`/api/categories`, {
                    headers: { 'Authorization': `Bearer ${session.token}` }
                });
                if (catRes.ok) {
                    const catData = await catRes.json();
                    setCategories(catData);
                }

                // Fetch Progress
                const progressRes = await fetch(`/api/goals/${id}/progress`, {
                    headers: { 'Authorization': `Bearer ${session.token}` }
                });
                if (progressRes.ok) {
                    const progressData = await progressRes.json();
                    setProgressList(progressData);
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, session, router]);



    const handleUpdateGoal = async () => {
        if (!goal || !session?.token) return;
        if (!editFormData.title.trim()) {
            toast.error('Title is required');
            return;
        }

        setSubmittingEdit(true);
        try {
            const res = await fetch(`/api/goals/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.token}`
                },
                body: JSON.stringify(editFormData)
            });

            if (res.ok) {
                const updatedGoal = await res.json();
                setGoal(updatedGoal);
                setIsEditOpen(false);
                toast.success('Goal updated successfully');
            } else {
                toast.error('Failed to update goal');
            }
        } catch (error) {
            console.error('Update failed', error);
            toast.error('Failed to update goal');
        } finally {
            setSubmittingEdit(false);
        }
    };

    const handleDeleteGoal = async () => {
        if (!goal || !session?.token) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/goals/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session.token}`
                }
            });

            if (res.ok) {
                toast.success('Goal deleted');
                router.push('/dashboard');
            } else {
                toast.error('Failed to delete goal');
            }
        } catch (error) {
            console.error('Delete failed', error);
            toast.error('Failed to delete goal');
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6 max-w-6xl space-y-6">
                <Skeleton className="h-12 w-1/3" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-3 space-y-4">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                    <div className="md:col-span-1">
                        <Skeleton className="h-64 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (!goal) return null;

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-card border-b border-border">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/dashboard')}>
                            <div className="p-2 bg-primary rounded-lg">
                                <Target className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <h1 className="text-xl font-bold text-foreground">GoalFlow</h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                                <User className="h-4 w-4" />
                                <span>{session?.name}</span>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Logout
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            You will be redirected to the login page.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={logout}>Logout</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto p-4 md:p-6 max-w-7xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div className="flex items-center gap-3">
                        <BookOpen className="h-6 w-6 text-muted-foreground" />
                        <h1 className="text-2xl font-semibold tracking-tight text-blue-600 hover:underline cursor-pointer">
                            {goal.title}
                        </h1>
                        <Badge variant={goal.status === 'done' ? "default" : "secondary"} className="rounded-full px-3">
                            {goal.type}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Settings Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <Settings className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                    // Reset form data to current goal state before opening
                                    setEditFormData({
                                        title: goal.title,
                                        description: goal.description,
                                        categoryId: goal.categoryId,
                                        type: goal.type,
                                        priority: goal.priority,
                                        status: goal.status,
                                    });
                                    setIsEditOpen(true);
                                }}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit Goal
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => setIsDeleteOpen(true)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Goal
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>


                    </div>
                </div>

                {/* Navigation Tabs (GitHub Style) */}
                <div className="border-b mb-6 overflow-x-auto">
                    <div className="flex gap-6">
                        <button className="flex items-center gap-2 px-3 py-2 border-b-2 border-orange-500 font-medium text-foreground text-sm">
                            <GitCommit className="h-4 w-4" />
                            Progress
                            <Badge variant="secondary" className="rounded-full h-5 px-1.5 text-xs">
                                {progressList.length}
                            </Badge>
                        </button>
                        {/* Add more tabs if needed like 'Issues' or 'Pull Requests' equivalent */}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Main Content */}
                    <div className="md:col-span-3 space-y-6">

                        {/* Action Bar */}
                        <div className="flex justify-between items-center bg-card p-3 rounded-t-md border border-b-0">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>Updated {formatDistanceToNow(new Date(goal.updatedAt), { addSuffix: true })}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Dialog open={isAddingProgress} onOpenChange={setIsAddingProgress}>
                                    <DialogTrigger asChild>
                                        <Button
                                            size="sm"
                                            className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                                            disabled={goal.status === 'done'}
                                        >
                                            Add progress
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add Progress Update</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label>Summary (Title)</Label>
                                                <Input
                                                    placeholder="What did you accomplish?"
                                                    value={newProgressTitle}
                                                    onChange={(e) => setNewProgressTitle(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Description</Label>
                                                <Textarea
                                                    placeholder="Add more details..."
                                                    value={newProgressDesc}
                                                    onChange={(e) => setNewProgressDesc(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsAddingProgress(false)}>Cancel</Button>
                                            <Button onClick={handleAddProgress} disabled={submittingProgress}>
                                                {submittingProgress ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Adding...</> : 'Commit Progress'}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>

                                {goal.status === 'done' ? (
                                    <Button size="sm" variant="outline" className="gap-2 border-orange-500 text-orange-600 hover:bg-orange-50" onClick={() => setIsReworkDialogOpen(true)}>
                                        <RotateCcw className="h-4 w-4" />
                                        ReWork
                                    </Button>
                                ) : (
                                    <Button size="sm" variant="default" className="gap-2" onClick={() => setIsCompleteDialogOpen(true)}>
                                        <CircleDot className="h-4 w-4" />
                                        Mark Completed
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Progress Table */}
                        <div className="border rounded-md rounded-t-none bg-card">
                            {progressList.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    No progress recorded yet. Start by adding an update!
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[200px]">Update</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead className="w-[150px] text-right">Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {progressList.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <span className="truncate">{item.title}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {item.description ? (
                                                        <p className="line-clamp-2 text-sm">{item.description}</p>
                                                    ) : (
                                                        <span className="italic text-xs text-muted-foreground/50">No description</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </div>

                        {/* README Section */}
                        <Card>
                            <CardHeader className="flex flex-row items-center gap-2 py-3 bg-muted/30 border-b">
                                <BookOpen className="h-4 w-4" />
                                <span className="text-sm font-semibold">Description</span>
                            </CardHeader>
                            <CardContent className="p-6">
                                <h3 className="text-xl font-bold mb-4">{goal.title}</h3>
                                <div className="prose dark:prose-invert max-w-none">
                                    <p>{goal.description || "No description provided."}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm">About</h3>
                            <p className="text-sm text-muted-foreground">
                                {goal.description || "No description available."}
                            </p>

                            <Separator />

                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Category</span>
                                    <span className="font-medium">{categories.find(c => c.id === goal.categoryId)?.name || "Unknown"}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Type</span>
                                    <span className="font-medium capitalize">{goal.type}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Priority</span>
                                    <Badge variant={goal.priority === 'high' ? 'destructive' : goal.priority === 'medium' ? 'default' : 'secondary'} className="uppercase text-[10px]">
                                        {goal.priority}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Goal Dialog */}
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Goal</DialogTitle>
                            <DialogDescription>Make changes to your goal here.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-title">Title</Label>
                                <Input
                                    id="edit-title"
                                    value={editFormData.title}
                                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-desc">Description</Label>
                                <Textarea
                                    id="edit-desc"
                                    value={editFormData.description}
                                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Category</Label>
                                    <Select
                                        value={editFormData.categoryId}
                                        onValueChange={(val) => setEditFormData({ ...editFormData, categoryId: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Type</Label>
                                    <Select
                                        value={editFormData.type}
                                        onValueChange={(val) => setEditFormData({ ...editFormData, type: val as GoalType })}
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
                                <div className="grid gap-2">
                                    <Label>Priority</Label>
                                    <Select
                                        value={editFormData.priority}
                                        onValueChange={(val) => setEditFormData({ ...editFormData, priority: val as GoalPriority })}
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
                                <div className="grid gap-2">
                                    <Label>Status</Label>
                                    <Select
                                        value={editFormData.status}
                                        onValueChange={(val) => setEditFormData({ ...editFormData, status: val as GoalStatus })}
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
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                            <Button onClick={handleUpdateGoal} disabled={submittingEdit}>
                                {submittingEdit ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Saving...</> : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Goal Alert Dialog */}
                <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your goal and remove all associated progress data.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteGoal} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isDeleting}>
                                {isDeleting ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Deleting...</> : 'Delete'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Mark Complete Alert Dialog */}
                <AlertDialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Mark Goal as Completed?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to mark this goal as completed? You will not be able to add further progress updates once it is completed.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmMarkCompleted} className="bg-green-600 hover:bg-green-700 text-white" disabled={isMarkingComplete}>
                                {isMarkingComplete ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Updating...</> : 'Mark Completed'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* ReWork Alert Dialog */}
                <AlertDialog open={isReworkDialogOpen} onOpenChange={setIsReworkDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Reopen Goal?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to reopen this goal? This will set the status back to "Working" and allow you to add new progress updates.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmRework} className="bg-orange-500 hover:bg-orange-600 text-white" disabled={isReworking}>
                                {isReworking ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Updating...</> : 'ReWork'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}
