import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ExpenseService } from '../../services/expense.service';
import { Expense } from '../../models/expense.model';

@Component({
  selector: 'app-expense-form',
  templateUrl: './expense-form.component.html',
  styleUrls: ['./expense-form.component.scss']
})
export class ExpenseFormComponent implements OnInit {
  expenseForm: FormGroup;
  isEdit = false;
  expenseId?: number;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  userCategories: string[] = [];

  // Common expense categories
  commonCategories = [
    'Food', 'Transportation', 'Housing', 'Entertainment', 
    'Healthcare', 'Utilities', 'Shopping', 'Education',
    'Travel', 'Personal Care', 'Gifts', 'Insurance',
    'Taxes', 'Savings', 'Investments', 'Other'
  ];

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.expenseForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadUserCategories();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEdit = true;
        this.expenseId = +params['id'];
        this.loadExpense(this.expenseId);
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      category: ['', [Validators.required, Validators.maxLength(50)]],
      amount: [0, [Validators.required, Validators.min(0.01), Validators.max(1000000)]],
      date: [new Date().toISOString().substring(0, 10), Validators.required],
      description: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(500)]],
      inflationRate: [0, [Validators.min(-100), Validators.max(100)]]
    });
  }

  loadUserCategories(): void {
    this.expenseService.getUserCategories().subscribe({
      next: (categories) => {
        this.userCategories = categories;
        // Merge with common categories and remove duplicates
        this.userCategories = [...new Set([...this.userCategories, ...this.commonCategories])].sort();
      },
      error: (error) => {
        console.error('Error loading user categories:', error);
        this.userCategories = this.commonCategories;
      }
    });
  }

  loadExpense(id: number): void {
    this.isLoading = true;
    this.expenseService.getExpenseById(id).subscribe({
      next: (expense) => {
        this.expenseForm.patchValue({
          category: expense.category,
          amount: expense.amount,
          date: expense.date.substring(0, 10),
          description: expense.description,
          inflationRate: expense.inflationRate || 0
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load expense. Please try again.';
        this.isLoading = false;
        console.error('Error loading expense:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.expenseForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const expense: Expense = {
        ...this.expenseForm.value,
        inflationRate: this.expenseForm.value.inflationRate || undefined
      };

      const operation = this.isEdit && this.expenseId
        ? this.expenseService.updateExpense(this.expenseId, expense)
        : this.expenseService.createExpense(expense);

      operation.subscribe({
        next: (savedExpense) => {
          this.isLoading = false;
          this.successMessage = this.isEdit 
            ? 'Expense updated successfully!' 
            : 'Expense created successfully!';
          
          // Redirect after short delay
          setTimeout(() => {
            this.router.navigate(['/expenses']);
          }, 1500);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = this.isEdit
            ? 'Failed to update expense. Please try again.'
            : 'Failed to create expense. Please try again.';
          console.error('Error saving expense:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.expenseForm.controls).forEach(key => {
      const control = this.expenseForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel(): void {
    if (this.expenseForm.dirty) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        this.router.navigate(['/expenses']);
      }
    } else {
      this.router.navigate(['/expenses']);
    }
  }

  addCustomCategory(): void {
    const customCategory = prompt('Enter new category name:');
    if (customCategory && customCategory.trim()) {
      const categoryControl = this.expenseForm.get('category');
      if (categoryControl) {
        categoryControl.setValue(customCategory.trim());
        // Add to user categories if not already present
        if (!this.userCategories.includes(customCategory.trim())) {
          this.userCategories.push(customCategory.trim());
          this.userCategories.sort();
        }
      }
    }
  }

  // Getters for easy access in template
  get category() { return this.expenseForm.get('category'); }
  get amount() { return this.expenseForm.get('amount'); }
  get date() { return this.expenseForm.get('date'); }
  get description() { return this.expenseForm.get('description'); }
  get inflationRate() { return this.expenseForm.get('inflationRate'); }
}