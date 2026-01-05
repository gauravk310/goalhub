
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Learning, LearningProgress, Category, LearningStatus } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import {
    Target,
    BookOpen,
    Settings,
    Pencil,
    Trash2,
    GitCommit,
    User,
    LogOut,
    ArrowLeft,
    Loader2,
    Calendar,
    RotateCcw,
    CheckCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

export default function LearningDetailPage() {
    const { id } = useParams();
    const { session, logout } = useAuth();
    const router = useRouter();

    const [learning, setLearning] = useState<Learning | null>(null);
    const [progressList, setProgressList] = useState<LearningProgress[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const [isAddingProgress, setIsAddingProgress] = useState(false);
    const [newProgressTitle, setNewProgressTitle] = useState('');
    const [newProgressDesc, setNewProgressDesc] = useState('');
    const [submittingProgress, setSubmittingProgress] = useState(false);

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [editFormData, setEditFormData] = useState({
        title: '',
        description: '',
        categoryId: '',
        status: 'pending' as LearningStatus,
        dueDate: '',
    });
    const [submittingEdit, setSubmittingEdit] = useState(false);

    useEffect(() => {
        if (!session?.token) return;

        const fetchData = async () => {
            try {
                // Fetch Learning Item
                const learningRes = await fetch(`/api/learnings/${id}`, {
                    headers: { 'Authorization': `Bearer ${session.token}` }
                });

                if (!learningRes.ok) {
                    if (learningRes.status === 404) router.push('/dashboard');
                    return;
                }
                const learningData = await learningRes.json();
                setLearning(learningData);
                setEditFormData({
                    title: learningData.title,
                    description: learningData.description,
                    categoryId: learningData.categoryId,
                    status: learningData.status,
                    dueDate: learningData.dueDate || '',
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
                const progressRes = await fetch(`/api/learnings/${id}/progress`, {
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

    const handleAddProgress = async () => {
        if (!newProgressTitle.trim() || !session?.token) return;
        setSubmittingProgress(true);
        try {
            const res = await fetch(`/api/learnings/${id}/progress`, {
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

    const handleUpdateLearning = async () => {
        if (!learning || !session?.token) return;
        if (!editFormData.title.trim()) {
            toast.error('Title is required');
            return;
        }

        setSubmittingEdit(true);
        try {
            const res = await fetch(`/api/learnings/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.token}`
                },
                body: JSON.stringify(editFormData)
            });

            if (res.ok) {
                const updatedLearning = await res.json();
                setLearning(updatedLearning);
                setIsEditOpen(false);
                toast.success('Learning item updated successfully');
            } else {
                toast.error('Failed to update item');
            }
        } catch (error) {
            console.error('Update failed', error);
            toast.error('Failed to update item');
        } finally {
            setSubmittingEdit(false);
        }
    };

    const handleDeleteLearning = async () => {
        if (!learning || !session?.token) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/learnings/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session.token}`
                }
            });

            if (res.ok) {
                toast.success('Item deleted');
                router.push('/dashboard');
            } else {
                toast.error('Failed to delete item');
            }
        } catch (error) {
            console.error('Delete failed', error);
            toast.error('Failed to delete item');
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
                </div>
            </div>
        );
    }

    if (!learning) return null;

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-50 bg-card border-b border-border">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/dashboard')}>
                            <div className="p-2 bg-primary rounded-lg">
                                <Target className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <h1 className="text-xl font-bold text-foreground">GoalHub</h1>
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
                        <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="mr-2">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <BookOpen className="h-6 w-6 text-muted-foreground" />
                        <h1 className="text-2xl font-semibold tracking-tight text-blue-600">
                            {learning.title}
                        </h1>
                        <Badge variant={learning.status === 'done' ? "default" : "secondary"} className="rounded-full px-3 capitalize">
                            {learning.status}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-3">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <Settings className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                    setEditFormData({
                                        title: learning.title,
                                        description: learning.description,
                                        categoryId: learning.categoryId,
                                        status: learning.status,
                                        dueDate: learning.dueDate || '',
                                    });
                                    setIsEditOpen(true);
                                }}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit Item
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => setIsDeleteOpen(true)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Item
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Main Content */}
                    <div className="md:col-span-3 space-y-6">

                        {/* Action Bar */}
                        <div className="flex justify-between items-center bg-card p-3 rounded-t-lg border border-b-0">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>Updated {formatDistanceToNow(new Date(learning.updatedAt), { addSuffix: true })}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Dialog open={isAddingProgress} onOpenChange={setIsAddingProgress}>
                                    <DialogTrigger asChild>
                                        <Button
                                            size="sm"
                                            className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                                            disabled={learning.status === 'done'}
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
                                                    placeholder="What did you learn today?"
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
                            </div>
                        </div>

                        {/* Progress Table */}
                        <div className="border rounded-lg rounded-t-none bg-card">
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
                                <h3 className="text-xl font-bold mb-4">{learning.title}</h3>
                                <div className="prose dark:prose-invert max-w-none">
                                    <p>{learning.description || "No description provided."}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm">About</h3>
                            <p className="text-sm text-muted-foreground">
                                {learning.description || "No description available."}
                            </p>

                            <Separator />

                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Category</span>
                                    <span className="font-medium">{categories.find(c => c.id === learning.categoryId)?.name || "Unknown"}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Due Date</span>
                                    <span className="font-medium">{learning.dueDate || "-"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Dialog */}
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Item</DialogTitle>
                            <DialogDescription>Make changes here.</DialogDescription>
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
                                    <Label>Status</Label>
                                    <Select
                                        value={editFormData.status}
                                        onValueChange={(val) => setEditFormData({ ...editFormData, status: val as LearningStatus })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="learning">Learning</SelectItem>
                                            <SelectItem value="done">Done</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-duedate">Due Date</Label>
                                <Input
                                    id="edit-duedate"
                                    type="date"
                                    value={editFormData.dueDate}
                                    onChange={(e) => setEditFormData({ ...editFormData, dueDate: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                            <Button onClick={handleUpdateLearning} disabled={submittingEdit}>
                                {submittingEdit ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Saving...</> : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Alert Dialog */}
                <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this item and its progress history.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteLearning} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isDeleting}>
                                {isDeleting ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Deleting...</> : 'Delete'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}
