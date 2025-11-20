import { Component, OnInit } from '@angular/core';
import { Goal, GoalSummary, UpcomingGoal } from '../../models/goal.model';
import { GoalService } from '../../services/goal.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'app-goal-list',
    templateUrl: './goal-list.component.html',
    styleUrls: ['./goal-list.component.scss']
})
export class GoalListComponent implements OnInit {
    goals: Goal[] = [];
    summary: GoalSummary | null = null;
    upcomingGoals: UpcomingGoal[] = [];
    isLoading: boolean = false;
    errorMessage: string = '';

    // Filter properties
    selectedCategory: string = '';
    maxDuration: number = 50;
    maxAmount: number = 1000000;

    // Categories for dropdown
    categories = ['SHORT_TERM', 'MEDIUM_TERM', 'LONG_TERM', 'RETIREMENT'];

    constructor(private goalService: GoalService, private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.loadGoals();
        this.loadSummary();
        this.loadUpcomingGoals();
    }

    loadGoals(): void {
        this.isLoading = true;
        this.errorMessage = '';

        this.goalService.getUserGoals().subscribe({
            next: (goals) => {
                this.goals = goals;
                this.isLoading = false;
            },
            error: (error) => {
                this.errorMessage = 'Failed to load goals. Please try again.';
                this.isLoading = false;
                console.error('Error loading goals:', error);
            }
        });
    }

    loadSummary(): void {
        this.goalService.getGoalsSummary().subscribe({
            next: (summary) => {
                this.summary = summary;
            },
            error: (error) => {
                console.error('Error loading goals summary:', error);
            }
        });
    }

    loadUpcomingGoals(): void {
        this.goalService.getUpcomingGoals(5).subscribe({
            next: (upcomingGoals) => {
                this.upcomingGoals = upcomingGoals;
            },
            error: (error) => {
                console.error('Error loading upcoming goals:', error);
            }
        });
    }

    deleteGoal(id: number): void {
        if (confirm('Are you sure you want to delete this goal?')) {
            this.goalService.deleteGoal(id).subscribe({
                next: () => {
                    this.goals = this.goals.filter(goal => goal.id !== id);
                    this.loadSummary();
                    this.loadUpcomingGoals();
                },
                error: (error) => {
                    this.errorMessage = 'Failed to delete goal. Please try again.';
                    console.error('Error deleting goal:', error);
                }
            });
        }
    }

    applyFilters(): void {
        if (this.selectedCategory) {
            this.goalService.getGoalsByCategory(this.selectedCategory).subscribe({
                next: (goals) => {
                    this.goals = goals.filter(goal =>
                        (goal.duration || 0) <= this.maxDuration &&
                        (goal.targetAmount || 0) <= this.maxAmount
                    );
                },
                error: (error) => {
                    this.errorMessage = 'Error applying filters.';
                }
            });
        } else {
            this.goals = this.goals.filter(goal =>
                (goal.duration || 0) <= this.maxDuration &&
                (goal.targetAmount || 0) <= this.maxAmount
            );
        }
    }

    clearFilters(): void {
        this.selectedCategory = '';
        this.maxDuration = 50;
        this.maxAmount = 1000000;
        this.loadGoals();
    }

    getCategoryColor(category: string): string {
        switch (category) {
            case 'SHORT_TERM': return 'info';
            case 'MEDIUM_TERM': return 'warning';
            case 'LONG_TERM': return 'primary';
            case 'RETIREMENT': return 'success';
            default: return 'secondary';
        }
    }

    getCategoryIcon(category: string): string {
        switch (category) {
            case 'SHORT_TERM': return 'fa-bolt';
            case 'MEDIUM_TERM': return 'fa-chart-line';
            case 'LONG_TERM': return 'fa-mountain';
            case 'RETIREMENT': return 'fa-umbrella-beach';
            default: return 'fa-bullseye';
        }
    }

    getCategoryDisplayName(category: string): string {
        switch (category) {
            case 'SHORT_TERM': return 'Short Term';
            case 'MEDIUM_TERM': return 'Medium Term';
            case 'LONG_TERM': return 'Long Term';
            case 'RETIREMENT': return 'Retirement';
            default: return category;
        }
    }

    calculateMonthlySavings(goal: Goal): number {
        if (!goal.targetAmount || !goal.duration) return 0;
        return goal.targetAmount / (goal.duration * 12);
    }

    getCategoryStats(): any[] {
        if (!this.summary?.categoryDistribution) return [];

        const total = this.summary.totalGoals;
        return Object.entries(this.summary.categoryDistribution).map(([category, count]) => ({
            category,
            count,
            percentage: (count / total) * 100,
            amount: this.summary?.categoryAmounts[category] || 0
        }));
    }

    getCurrentUser() {
        return this.authService.getCurrentUser();
    }

}