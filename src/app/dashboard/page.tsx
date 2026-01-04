"use client";

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Goal, Category } from '@/types';
import { getGoals, getCategories, getAllProgress } from '@/lib/dataService';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CategoryManager from '@/components/CategoryManager';
import GoalManager from '@/components/GoalManager';
import DashboardCharts from '@/components/DashboardCharts';
import { Target, LayoutDashboard, ListTodo, FolderOpen, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GoalProgress } from '@/types';

const DashboardContent: React.FC = () => {
    const { session, logout } = useAuth();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [progress, setProgress] = useState<GoalProgress[]>([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [activeTab, setActiveTab] = useState('dashboard');

    const loadData = async () => {
        if (session) {
            try {
                const [userGoals, userCats, userProgress] = await Promise.all([
                    getGoals(session.userId),
                    getCategories(session.userId),
                    getAllProgress(session.userId),
                ]);
                setGoals(userGoals);
                setCategories(userCats);
                setProgress(userProgress);
            } catch (error) {
                console.error(error);
            }
        }
    };

    useEffect(() => {
        loadData();
    }, [session, refreshTrigger]);

    const handleCategoryChange = () => {
        setRefreshTrigger((prev) => prev + 1);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-card border-b border-border">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
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
                            <Button variant="outline" size="sm" onClick={logout}>
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation Bar */}
            <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-16 z-40 hidden md:block">
                <div className="container mx-auto px-4">
                    <nav className="flex items-center gap-1 py-2">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all",
                                activeTab === 'dashboard'
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <LayoutDashboard className="h-4 w-4" />
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('goals')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all",
                                activeTab === 'goals'
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <ListTodo className="h-4 w-4" />
                            Goals
                        </button>
                        <button
                            onClick={() => setActiveTab('categories')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all",
                                activeTab === 'categories'
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <FolderOpen className="h-4 w-4" />
                            Categories
                        </button>
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full max-w-md grid-cols-3 mb-6 md:hidden">
                        <TabsTrigger value="dashboard" className="flex items-center gap-2">
                            <LayoutDashboard className="h-4 w-4" />
                            <span className="hidden sm:inline">Overview</span>
                        </TabsTrigger>
                        <TabsTrigger value="goals" className="flex items-center gap-2">
                            <ListTodo className="h-4 w-4" />
                            <span className="hidden sm:inline">Goals</span>
                        </TabsTrigger>
                        <TabsTrigger value="categories" className="flex items-center gap-2">
                            <FolderOpen className="h-4 w-4" />
                            <span className="hidden sm:inline">Categories</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="dashboard" className="animate-fade-in">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-foreground">Performance Overview</h2>
                            <p className="text-muted-foreground">Track your goal progress and analytics</p>
                        </div>
                        <DashboardCharts goals={goals} categories={categories} progress={progress} />
                    </TabsContent>

                    <TabsContent value="goals" className="animate-fade-in">
                        <GoalManager refreshTrigger={refreshTrigger} />
                    </TabsContent>

                    <TabsContent value="categories" className="animate-fade-in">
                        <div className="w-full">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-foreground">Manage Categories</h2>
                                <p className="text-muted-foreground">Organize your goals into categories</p>
                            </div>
                            <CategoryManager onCategoryChange={handleCategoryChange} />
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
};

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <DashboardContent />
        </ProtectedRoute>
    )
}
