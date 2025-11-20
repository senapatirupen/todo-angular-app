import { Component, OnInit } from '@angular/core';
import { Expense, ExpenseSummary, CategoryExpenses } from '../../models/expense.model';
import { ExpenseService } from '../../services/expense.service';

@Component({
  selector: 'app-expense-list',
  templateUrl: './expense-list.component.html',
  styleUrls: ['./expense-list.component.scss']
})
export class ExpenseListComponent implements OnInit {
  expenses: Expense[] = [];
  filteredExpenses: Expense[] = [];
  summary: ExpenseSummary | null = null;
  categoryExpenses: CategoryExpenses = {};
  userCategories: string[] = [];
  
  selectedMonth: Date = new Date();
  totalAmount: number = 0;
  
  // Filter properties
  categoryFilter: string = '';
  dateFilter: string = '';
  searchDescription: string = '';
  minAmount: number = 0;
  maxAmount: number = 10000;

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  // Loading states
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private expenseService: ExpenseService) { }

  ngOnInit(): void {
    this.loadExpenses();
    this.loadSummary();
    this.loadUserCategories();
  }

  loadExpenses(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    const year = this.selectedMonth.getFullYear();
    const month = this.selectedMonth.getMonth() + 1;
    
    this.expenseService.getMonthlyExpenses(year, month).subscribe({
      next: (expenses) => {
        this.expenses = expenses;
        this.filteredExpenses = expenses;
        this.calculateTotal();
        this.loadCategoryExpenses(year, month);
        this.calculatePagination();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load expenses. Please try again.';
        this.isLoading = false;
        console.error('Error loading expenses:', error);
      }
    });
  }

  loadSummary(): void {
    this.expenseService.getExpensesSummary().subscribe({
      next: (summary) => {
        this.summary = summary;
      },
      error: (error) => {
        console.error('Error loading expense summary:', error);
      }
    });
  }

  loadCategoryExpenses(year: number, month: number): void {
    this.expenseService.getCategoryWiseExpenses(year, month).subscribe({
      next: (categoryExpenses) => {
        this.categoryExpenses = categoryExpenses;
      },
      error: (error) => {
        console.error('Error loading category expenses:', error);
      }
    });
  }

  loadUserCategories(): void {
    this.expenseService.getUserCategories().subscribe({
      next: (categories) => {
        this.userCategories = categories;
      },
      error: (error) => {
        console.error('Error loading user categories:', error);
      }
    });
  }

  calculateTotal(): void {
    this.totalAmount = this.filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }

  applyFilters(): void {
    this.filteredExpenses = this.expenses.filter(expense => {
      const categoryMatch = !this.categoryFilter || 
        expense.category.toLowerCase().includes(this.categoryFilter.toLowerCase());
      const dateMatch = !this.dateFilter || expense.date.includes(this.dateFilter);
      const descriptionMatch = !this.searchDescription ||
        expense.description.toLowerCase().includes(this.searchDescription.toLowerCase());
      const amountMatch = expense.amount >= this.minAmount && expense.amount <= this.maxAmount;
      
      return categoryMatch && dateMatch && descriptionMatch && amountMatch;
    });
    this.calculateTotal();
    this.calculatePagination();
    this.currentPage = 1;
  }

  clearFilters(): void {
    this.categoryFilter = '';
    this.dateFilter = '';
    this.searchDescription = '';
    this.minAmount = 0;
    this.maxAmount = 10000;
    this.applyFilters();
  }

  onMonthChange(event: any): void {
    const valueAsDate = event.target.valueAsDate;
    if (valueAsDate) {
      this.selectedMonth = valueAsDate;
      this.currentPage = 1;
      this.loadExpenses();
    }
  }

  deleteExpense(id: number): void {
    if (confirm('Are you sure you want to delete this expense?')) {
      this.expenseService.deleteExpense(id).subscribe({
        next: () => {
          this.expenses = this.expenses.filter(expense => expense.id !== id);
          this.filteredExpenses = this.filteredExpenses.filter(expense => expense.id !== id);
          this.calculateTotal();
          this.calculatePagination();
          this.loadSummary();
          this.loadCategoryExpenses(this.selectedMonth.getFullYear(), this.selectedMonth.getMonth() + 1);
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete expense. Please try again.';
          console.error('Error deleting expense:', error);
        }
      });
    }
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredExpenses.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }
  }

  get paginatedExpenses(): Expense[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredExpenses.slice(startIndex, endIndex);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  getCategoryKeys(): string[] {
    return Object.keys(this.categoryExpenses);
  }

  getCategoryTotal(category: string): number {
    return this.categoryExpenses[category] || 0;
  }

  getCategoryPercentage(category: string): number {
    if (this.totalAmount === 0) return 0;
    return (this.getCategoryTotal(category) / this.totalAmount) * 100;
  }

  exportToCSV(): void {
    const headers = ['Date', 'Category', 'Description', 'Amount', 'Inflation Rate'];
    const csvData = this.filteredExpenses.map(expense => [
      expense.date,
      expense.category,
      `"${expense.description}"`,
      expense.amount.toString(),
      expense.inflationRate ? expense.inflationRate.toString() + '%' : ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expenses-${this.selectedMonth.getFullYear()}-${this.selectedMonth.getMonth() + 1}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'Food': 'primary',
      'Transportation': 'success',
      'Housing': 'info',
      'Entertainment': 'warning',
      'Healthcare': 'danger',
      'Utilities': 'secondary',
      'Shopping': 'dark',
      'Education': 'primary',
      'Travel': 'info',
      'Personal Care': 'success',
      'Gifts': 'warning',
      'Insurance': 'danger',
      'Taxes': 'secondary',
      'Savings': 'success',
      'Investments': 'info',
      'Other': 'secondary'
    };
    return colors[category] || 'secondary';
  }
}