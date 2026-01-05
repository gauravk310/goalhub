"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    Target,
    CheckCircle2,
    BarChart3,
    ArrowRight,
    Sparkles,
    BookOpen,
    Trophy,
    TrendingUp,
    Layers,
    Clock,
    ShieldCheck,
    Github
} from 'lucide-react';

const Index: React.FC = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary p-2 rounded-lg">
                            <Target className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                            GoalFlow
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/auth">
                            <Button variant="ghost" className="hidden sm:inline-flex">
                                Sign In
                            </Button>
                        </Link>
                        <Link href="/auth">
                            <Button>
                                Get Started
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1 pt-16">
                {/* Hero Section */}
                <section className="relative overflow-hidden py-24 md:py-32">
                    <div className="absolute inset-0 bg-grid-primary/[0.02] -z-10" />
                    <div className="absolute h-full w-full bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

                    <div className="container mx-auto px-4 text-center relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-8 animate-fade-in border border-primary/20">
                            <Sparkles className="h-4 w-4" />
                            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent font-bold">
                                V1.0 is Live
                            </span>
                            - The Ultimate Productivity Hub
                        </div>

                        <h1 className="text-5xl md:text-7xl font-extrabold text-foreground mb-8 tracking-tight max-w-4xl mx-auto leading-tight">
                            Master Your Life <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-blue-500">
                                One Goal at a Time
                            </span>
                        </h1>

                        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                            Stop dreaming and start achieving. GoalFlow brings your daily tasks,
                            long-term vision, and learning journey into one unified, intelligent workspace.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link href="/auth" className="w-full sm:w-auto">
                                <Button size="lg" className="h-12 px-8 w-full text-lg shadow-lg shadow-primary/25">
                                    Start Tracking Free
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>

                        </div>


                    </div>
                </section>

                {/* Services / Features Grid - Bento Style */}
                <section className="py-24 bg-secondary/30">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                                We've crafted a comprehensive suite of tools designed to handle every aspect of your personal growth journey.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                            {/* Card 1: Core Goal Management (Large) */}
                            <div className="md:col-span-2 p-8 bg-card rounded-3xl border border-border/50 hover:border-primary/50 transition-colors shadow-sm group">
                                <div className="h-12 w-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                                    <CheckCircle2 className="h-6 w-6 text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">Core Goal Tracking</h3>
                                <p className="text-muted-foreground mb-6 text-lg">
                                    Break down your ambitions into manageable pieces. Set daily tasks for immediate action,
                                    weekly targets for momentum, and monthly objectives for big-picture progress.
                                </p>
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <li className="flex items-center text-sm font-medium text-foreground/80">
                                        <div className="h-2 w-2 rounded-full bg-blue-500 mr-2" />
                                        Smart Priority Management
                                    </li>
                                    <li className="flex items-center text-sm font-medium text-foreground/80">
                                        <div className="h-2 w-2 rounded-full bg-blue-500 mr-2" />
                                        Daily/Weekly/Monthly Views
                                    </li>
                                    <li className="flex items-center text-sm font-medium text-foreground/80">
                                        <div className="h-2 w-2 rounded-full bg-blue-500 mr-2" />
                                        Recurring Goals
                                    </li>
                                    <li className="flex items-center text-sm font-medium text-foreground/80">
                                        <div className="h-2 w-2 rounded-full bg-blue-500 mr-2" />
                                        Progress Tracking
                                    </li>
                                </ul>
                            </div>

                            {/* Card 2: Long Term Vision */}
                            <div className="p-8 bg-card rounded-3xl border border-border/50 hover:border-primary/50 transition-colors shadow-sm group">
                                <div className="h-12 w-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
                                    <Trophy className="h-6 w-6 text-purple-600" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">Long-Term Vision</h3>
                                <p className="text-muted-foreground mb-4">
                                    Don't lose sight of the horizon. Plan 1, 3, or 5 years ahead and align your daily actions with your ultimate purpose.
                                </p>
                            </div>

                            {/* Card 3: Learning Hub */}
                            <div className="p-8 bg-card rounded-3xl border border-border/50 hover:border-primary/50 transition-colors shadow-sm group">
                                <div className="h-12 w-12 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-500/20 transition-colors">
                                    <BookOpen className="h-6 w-6 text-orange-600" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">Learning Hub</h3>
                                <p className="text-muted-foreground mb-4">
                                    Organize your self-education. Track courses, books, and resources alongside your goals. Keep your growth structured.
                                </p>
                            </div>

                            {/* Card 4: Analytics & Insights (Large) */}
                            <div className="md:col-span-2 p-8 bg-card rounded-3xl border border-border/50 hover:border-primary/50 transition-colors shadow-sm group">
                                <div className="h-12 w-12 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-500/20 transition-colors">
                                    <BarChart3 className="h-6 w-6 text-green-600" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">Advanced Analytics</h3>
                                <p className="text-muted-foreground mb-6 text-lg">
                                    Visualize your consistency with GitHub-style contribution heatmaps and detailed completion charts.
                                    Know exactly when you perform your best.
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-background/50 p-4 rounded-xl border border-border">
                                        <TrendingUp className="h-5 w-5 text-green-600 mb-2" />
                                        <div className="font-semibold">Performance Trends</div>
                                        <div className="text-xs text-muted-foreground">Track consistency over time</div>
                                    </div>
                                    <div className="bg-background/50 p-4 rounded-xl border border-border">
                                        <Layers className="h-5 w-5 text-green-600 mb-2" />
                                        <div className="font-semibold">Category Breakdown</div>
                                        <div className="text-xs text-muted-foreground">See where you spend effort</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="py-24">
                    <div className="container mx-auto px-4">
                        <div className="mb-16 text-center">
                            <h2 className="text-3xl font-bold mb-4">Simple Workflow, Massive Result</h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8 relative">
                            {/* Connector Line (Desktop) */}
                            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -z-10" />

                            <div className="text-center pt-8">
                                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg shadow-primary/25 border-4 border-background">
                                    1
                                </div>
                                <h3 className="text-xl font-bold mb-2">Define Your Vision</h3>
                                <p className="text-muted-foreground">Set your long-term ambitions and break them down into categories.</p>
                            </div>
                            <div className="text-center pt-8">
                                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg shadow-primary/25 border-4 border-background">
                                    2
                                </div>
                                <h3 className="text-xl font-bold mb-2">Plan Daily Actions</h3>
                                <p className="text-muted-foreground">Create daily and weekly tasks that move the needle forward.</p>
                            </div>
                            <div className="text-center pt-8">
                                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg shadow-primary/25 border-4 border-background">
                                    3
                                </div>
                                <h3 className="text-xl font-bold mb-2">Track & Optimize</h3>
                                <p className="text-muted-foreground">Check off tasks, review analytics, and adjust your strategy.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-24 container mx-auto px-4">
                    <div className="bg-primary text-primary-foreground rounded-3xl p-8 md:p-16 text-center relative overflow-hidden">
                        {/* Abstract Background Shapes */}
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                            <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl" />
                            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl" />
                        </div>

                        <div className="relative z-10 max-w-3xl mx-auto">
                            <h2 className="text-3xl md:text-5xl font-bold mb-6">
                                Ready to Transform Your Productivity?
                            </h2>
                            <p className="text-primary-foreground/80 mb-10 text-xl font-light">
                                Join our community of achievers. No credit card required.
                            </p>
                            <Link href="/auth">
                                <Button size="lg" variant="secondary" className="h-14 px-10 text-lg shadow-xl hover:shadow-2xl transition-all">
                                    Get Started Now
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <div className="mt-8 flex items-center justify-center gap-6 text-sm opacity-80">
                                <span className="flex items-center gap-1">
                                    <ShieldCheck className="h-4 w-4" />
                                    Secure Data
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    Free Forever Tier
                                </span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t border-border bg-muted/30">
                <div className="container mx-auto px-4 py-12">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <Target className="h-6 w-6 text-primary" />
                                <span className="text-xl font-bold">GoalFlow</span>
                            </div>
                            <p className="text-muted-foreground max-w-sm">
                                Empowering individuals to achieve their dreams through structured planning and intelligent tracking.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Product</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Roadmap</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                        <p>© {new Date().getFullYear()} GoalFlow. All rights reserved.</p>
                        <div className="flex gap-6">
                            <a href="#" className="hover:text-primary">Privacy Policy</a>
                            <a href="#" className="hover:text-primary">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div >
    );
};

export default Index;
