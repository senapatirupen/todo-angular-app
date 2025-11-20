export interface Expense {
  id?: number;
  category: string;
  amount: number;
  date: string;
  description: string;
  inflationRate?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExpenseSummary {
  totalExpenses: number;
  totalAmount: number;
  currentMonthTotal: number;
  currentYearTotal: number;
  averageMonthlyExpense: number;
}

export interface CategoryExpenses {
  [key: string]: number;
}

export interface MonthlyTrend {
  year: number;
  month: number;
  monthName: string;
  total: number;
}