import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GoalService } from '../../services/goal.service';
import { Goal } from '../../models/goal.model';

@Component({
    selector: 'app-goal-form',
    templateUrl: './goal-form.component.html',
    styleUrls: ['./goal-form.component.scss']
})
export class GoalFormComponent implements OnInit {
    goalForm: FormGroup;
    isEdit = false;
    goalId?: number;
    isLoading = false;
    errorMessage = '';
    successMessage = '';
    calculatedValues: any = {};

    // Dropdown options
    categories = ['SHORT_TERM', 'MEDIUM_TERM', 'LONG_TERM', 'RETIREMENT'];

    constructor(
        private fb: FormBuilder,
        private goalService: GoalService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.goalForm = this.createForm();
    }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.isEdit = true;
                this.goalId = +params['id'];
                this.loadGoal(this.goalId);
            }
        });

        // Recalculate when form values change
        this.goalForm.valueChanges.subscribe(() => {
            this.calculateInflationAdjustedAmount();
        });
    }

    createForm(): FormGroup {
        return this.fb.group({
            name: ['', [Validators.required, Validators.maxLength(100)]],
            category: ['', Validators.required],
            duration: [null, [Validators.required, Validators.min(1), Validators.max(50)]],
            targetAmount: [null, [Validators.required, Validators.min(1), Validators.max(10000000)]],
            inflationRate: [6, [Validators.min(0), Validators.max(20)]],
            notes: ['']
        });
    }

    loadGoal(id: number): void {
        this.isLoading = true;
        this.goalService.getGoalById(id).subscribe({
            next: (goal) => {
                this.goalForm.patchValue({
                    name: goal.name,
                    category: goal.category,
                    duration: goal.duration,
                    targetAmount: goal.targetAmount,
                    inflationRate: goal.inflationRate || 6,
                    notes: goal.notes || ''
                });
                this.calculatedValues = {
                    inflationAdjustedAmount: goal.inflationAdjustedAmount
                };
                this.isLoading = false;
            },
            error: (error) => {
                this.errorMessage = 'Failed to load goal. Please try again.';
                this.isLoading = false;
                console.error('Error loading goal:', error);
            }
        });
    }

    calculateInflationAdjustedAmount(): void {
        const formValue = this.goalForm.value;
        if (formValue.targetAmount && formValue.duration && formValue.inflationRate) {
            const targetAmount = formValue.targetAmount;
            const duration = formValue.duration;
            const inflationRate = formValue.inflationRate / 100;

            // Calculate inflation adjusted amount: FV = PV * (1 + r)^n
            const inflationAdjustedAmount = targetAmount * Math.pow(1 + inflationRate, duration);
            const monthlySavings = targetAmount / (duration * 12);

            this.calculatedValues = {
                inflationAdjustedAmount: Math.round(inflationAdjustedAmount * 100) / 100,
                monthlySavings: Math.round(monthlySavings * 100) / 100,
                totalMonths: duration * 12
            };
        } else {
            this.calculatedValues = {};
        }
    }

    onSubmit(): void {
        if (this.goalForm.valid) {
            this.isLoading = true;
            this.errorMessage = '';
            this.successMessage = '';

            const goal: Goal = this.goalForm.value;

            const operation = this.isEdit && this.goalId
                ? this.goalService.updateGoal(this.goalId, goal)
                : this.goalService.createGoal(goal);

            operation.subscribe({
                next: (savedGoal) => {
                    this.isLoading = false;
                    this.successMessage = this.isEdit
                        ? 'Goal updated successfully!'
                        : 'Goal created successfully!';

                    setTimeout(() => {
                        this.router.navigate(['/goals']);
                    }, 1500);
                },
                error: (error) => {
                    this.isLoading = false;
                    this.errorMessage = this.isEdit
                        ? 'Failed to update goal. Please try again.'
                        : 'Failed to create goal. Please try again.';
                    console.error('Error saving goal:', error);
                }
            });
        } else {
            this.markFormGroupTouched();
        }
    }

    markFormGroupTouched(): void {
        Object.keys(this.goalForm.controls).forEach(key => {
            const control = this.goalForm.get(key);
            control?.markAsTouched();
        });
    }

    onCancel(): void {
        if (this.goalForm.dirty) {
            if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
                this.router.navigate(['/goals']);
            }
        } else {
            this.router.navigate(['/goals']);
        }
    }

    // Getters for easy access in template
    get name() { return this.goalForm.get('name'); }
    get category() { return this.goalForm.get('category'); }
    get duration() { return this.goalForm.get('duration'); }
    get targetAmount() { return this.goalForm.get('targetAmount'); }
    get inflationRate() { return this.goalForm.get('inflationRate'); }
    get notes() { return this.goalForm.get('notes'); }

    // Add these methods to your GoalFormComponent class
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
}