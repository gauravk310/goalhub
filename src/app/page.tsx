"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Target, CheckCircle2, BarChart3, Calendar, ArrowRight, Sparkles } from 'lucide-react';

const Index: React.FC = () => {
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="container mx-auto px-4 py-6">
                <nav className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary rounded-lg">
                            <Target className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold text-foreground">GoalFlow</span>
                    </div>
                    <Link href="/auth">
                        <Button>
                            Get Started
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </nav>
            </header>

            {/* Hero Section */}
            <section className="container mx-auto px-4 py-16 md:py-24">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6 animate-fade-in">
                        <Sparkles className="h-4 w-4" />
                        Track, Achieve, Succeed
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 animate-slide-up">
                        Achieve Your Goals with
                        <span className="text-primary"> Clarity</span>
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '100ms' }}>
                        A powerful goal tracking application that helps you organize, prioritize, and accomplish
                        your daily, weekly, and monthly objectives with insightful analytics.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '200ms' }}>
                        <Link href="/auth">
                            <Button size="lg" className="w-full sm:w-auto">
                                Start Tracking Free
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Button size="lg" variant="outline" className="w-full sm:w-auto">
                            Learn More
                        </Button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="container mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-foreground mb-4">Everything You Need</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Powerful features designed to help you stay focused and achieve more.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <div className="p-6 bg-card rounded-xl border border-border hover:shadow-lg transition-shadow animate-fade-in">
                        <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                            <CheckCircle2 className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">Smart Organization</h3>
                        <p className="text-muted-foreground">
                            Organize goals by categories, priorities, and timeframes. Keep everything structured
                            and easy to manage.
                        </p>
                    </div>

                    <div className="p-6 bg-card rounded-xl border border-border hover:shadow-lg transition-shadow animate-fade-in" style={{ animationDelay: '100ms' }}>
                        <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                            <BarChart3 className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">Insightful Analytics</h3>
                        <p className="text-muted-foreground">
                            Track your progress with beautiful charts and statistics. Understand your productivity
                            patterns.
                        </p>
                    </div>

                    <div className="p-6 bg-card rounded-xl border border-border hover:shadow-lg transition-shadow animate-fade-in" style={{ animationDelay: '200ms' }}>
                        <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                            <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">Flexible Scheduling</h3>
                        <p className="text-muted-foreground">
                            Set daily, weekly, or monthly goals. Adapt your planning to match your lifestyle and
                            workflow.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="container mx-auto px-4 py-16">
                <div className="bg-primary rounded-2xl p-8 md:p-12 text-center">
                    <h2 className="text-3xl font-bold text-primary-foreground mb-4">
                        Ready to Achieve More?
                    </h2>
                    <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
                        Join thousands of users who are already tracking their goals and boosting their
                        productivity.
                    </p>
                    <Link href="/auth">
                        <Button size="lg" variant="secondary">
                            Get Started Now
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="container mx-auto px-4 py-8 border-t border-border">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        <span className="font-semibold text-foreground">GoalFlow</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        © 2024 GoalFlow. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Index;
