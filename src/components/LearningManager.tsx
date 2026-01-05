
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Learning, Category, LearningFilters, LearningStatus } from '@/types';
import { getLearnings, getCategories, createLearning, updateLearning, deleteLearning } from '@/lib/dataService';
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
    BookOpen,
    Calendar,
    CheckCircle2,
    Circle,
    Clock,
    Target
} from 'lucide-react';
import { format } from 'date-fns';

const STATUS_CONFIG: Record<LearningStatus, { label: string; icon: React.ReactNode; className: string }> = {
    pending: {
        label: 'Pending',
        icon: <Circle className="h-4 w-4" />,
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
    },
    learning: {
        label: 'Learning',
        icon: <Clock className="h-4 w-4" />,
        className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
    },
    done: {
        label: 'Done',
        icon: <CheckCircle2 className="h-4 w-4" />,
        className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
    },
};

interface LearningManagerProps {
    refreshTrigger?: number;
}

const LearningManager: React.FC<LearningManagerProps> = ({ refreshTrigger }) => {
    const { session } = useAuth();
    const [learnings, setLearnings] = useState<Learning[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [filters, setFilters] = useState<LearningFilters>({});
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedLearning, setSelectedLearning] = useState<Learning | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        categoryId: '',
        status: 'pending' as LearningStatus,
        dueDate: '',
    });

    const loadData = async () => {
        if (session) {
            try {
                const [userLearnings, userCats] = await Promise.all([
                    getLearnings(session.userId),
                    getCategories(session.userId),
                ]);
                setLearnings(userLearnings);
                setCategories(userCats);
            } catch (error) {
                console.error('Failed to load data', error);
            }
        }
    };

    useEffect(() => {
        loadData();
    }, [session, refreshTrigger]);

    const filteredLearnings = useMemo(() => {
        return learnings.filter((learning) => {
            if (filters.categoryId && learning.categoryId !== filters.categoryId) return false;
            if (filters.status && learning.status !== filters.status) return false;
            if (filters.search) {
                const search = filters.search.toLowerCase();
                return (
                    learning.title.toLowerCase().includes(search) ||
                    learning.description.toLowerCase().includes(search)
                );
            }
            return true;
        }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [learnings, filters]);

    const getCategoryById = (id: string) => categories.find((c) => c.id === id);

    const handleOpenCreate = () => {
        setSelectedLearning(null);
        setFormData({
            title: '',
            description: '',
            categoryId: categories[0]?.id || '',
            status: 'pending',
            dueDate: '',
        });
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (learning: Learning) => {
        setSelectedLearning(learning);
        setFormData({
            title: learning.title,
            description: learning.description,
            categoryId: learning.categoryId,
            status: learning.status,
            dueDate: learning.dueDate || '',
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error('Please enter a title');
            return;
        }

        if (!formData.categoryId) {
            toast.error('Please select a category');
            return;
        }

        try {
            if (selectedLearning) {
                await updateLearning(selectedLearning.id, formData);
                toast.success('Learning item updated');
            } else if (session) {
                await createLearning(
                    session.userId,
                    formData.categoryId,
                    formData.title,
                    formData.description,
                    formData.status,
                    formData.dueDate
                );
                toast.success('Learning item created');
            }

            loadData();
            setIsDialogOpen(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to save item');
        }
    };

    const handleDelete = async () => {
        if (selectedLearning) {
            try {
                await deleteLearning(selectedLearning.id);
                toast.success('Learning item deleted');
                loadData();
                setIsDeleteDialogOpen(false);
                setSelectedLearning(null);
            } catch (error) {
                toast.error('Failed to delete item');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 p-2 bg-card rounded-lg border border-border">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search learning list..."
                        value={filters.search || ''}
                        onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                        className="pl-10 h-10 bg-background border-border focus-visible:ring-offset-0"
                    />
                </div>

                {/* Filters Group */}
                <div className="flex flex-wrap items-center gap-2">
                    <Select
                        value={filters.categoryId || 'all'}
                        onValueChange={(v) => setFilters((prev) => ({ ...prev, categoryId: v === 'all' ? undefined : v }))}
                    >
                        <SelectTrigger className="w-[140px] h-10 bg-background">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                                        {cat.name}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.status || 'all'}
                        onValueChange={(v) => setFilters((prev) => ({ ...prev, status: v === 'all' ? undefined : (v as LearningStatus) }))}
                    >
                        <SelectTrigger className="w-[110px] h-10 bg-background">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="learning">Learning</SelectItem>
                            <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        onClick={handleOpenCreate}
                        disabled={categories.length === 0}
                        className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-4 ml-2"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New
                    </Button>
                </div>
            </div>

            {/* List */}
            {categories.length === 0 ? (
                <div className="text-center py-12">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No categories yet</h3>
                    <p className="text-muted-foreground">Create a category first to start adding items.</p>
                </div>
            ) : filteredLearnings.length === 0 ? (
                <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No learning items found</h3>
                    <p className="text-muted-foreground">
                        Create your first learning goal to get started!
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredLearnings.map((learning) => {
                        const category = getCategoryById(learning.categoryId);
                        return (
                            <div
                                key={learning.id}
                                className="p-4 bg-card rounded-lg border border-border hover:shadow-md transition-all animate-fade-in"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <Link href={`/learning/${learning.id}`} className="block min-w-0 flex-1 hover:underline">
                                                <h3 className="font-semibold text-foreground truncate">{learning.title}</h3>
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
                                        {learning.description && (
                                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                                {learning.description}
                                            </p>
                                        )}
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge variant="outline" className={STATUS_CONFIG[learning.status].className}>
                                                {STATUS_CONFIG[learning.status].icon}
                                                <span className="ml-1">{STATUS_CONFIG[learning.status].label}</span>
                                            </Badge>
                                            {learning.dueDate && (
                                                <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    {learning.dueDate}
                                                </Badge>
                                            )}
                                        </div>
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
                        <DialogTitle>{selectedLearning ? 'Edit Item' : 'New Learning Item'}</DialogTitle>
                        <DialogDescription>
                            {selectedLearning ? 'Update the details below.' : 'What do you want to learn?'}
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
                                    placeholder="e.g., Learn React Native"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                    placeholder="Add details about what you want to achieve..."
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
                                    <Label>Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(v) => setFormData((prev) => ({ ...prev, status: v as LearningStatus }))}
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
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="dueDate">Due Date (Optional)</Label>
                                    <Input
                                        id="dueDate"
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">{selectedLearning ? 'Update' : 'Create'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Item</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{selectedLearning?.title}"? This action cannot be undone.
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

export default LearningManager;
