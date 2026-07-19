import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { 
  Expense, 
  ExpenseSummary, 
  CategoryExpenses, 
  MonthlyTrend 
} from '../models/expense.model';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getAuthHeaders(): HttpHeaders {
    return this.authService.getAuthHeaders();
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.status === 401) {
        errorMessage = 'Unauthorized: Please login again.';
        this.authService.logout();
      } else if (error.status === 403) {
        errorMessage = 'Forbidden: You do not have permission to perform this action.';
      } else if (error.status === 404) {
        errorMessage = 'Not Found: The requested resource was not found.';
      } else {
        errorMessage = `Error Code: ${error.status} Message: ${error.message}`;
      }
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }

  createExpense(expense: Expense): Observable<Expense> {
    return this.http.post<Expense>(`${this.apiUrl}/expenses`, expense, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getUserExpenses(): Observable<Expense[]> {
    return this.http.get<Expense[]>(`${this.apiUrl}/expenses`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getExpenseById(id: number): Observable<Expense> {
    return this.http.get<Expense>(`${this.apiUrl}/expenses/${id}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateExpense(id: number, expense: Expense): Observable<Expense> {
    return this.http.put<Expense>(`${this.apiUrl}/expenses/${id}`, expense, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteExpense(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/expenses/${id}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getExpensesByCategory(category: string): Observable<Expense[]> {
    return this.http.get<Expense[]>(`${this.apiUrl}/expenses/category/${category}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getMonthlyExpenses(year: number, month: number): Observable<Expense[]> {
    const params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());
    return this.http.get<Expense[]>(`${this.apiUrl}/expenses/monthly`, { 
      headers: this.getAuthHeaders(),
      params: params
    }).pipe(catchError(this.handleError));
  }

  getYearlyExpenses(year: number): Observable<Expense[]> {
    const params = new HttpParams().set('year', year.toString());
    return this.http.get<Expense[]>(`${this.apiUrl}/expenses/yearly`, { 
      headers: this.getAuthHeaders(),
      params: params
    }).pipe(catchError(this.handleError));
  }

  getExpensesByDateRange(startDate: string, endDate: string): Observable<Expense[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<Expense[]>(`${this.apiUrl}/expenses/date-range`, { 
      headers: this.getAuthHeaders(),
      params: params
    }).pipe(catchError(this.handleError));
  }

  getExpensesSummary(): Observable<ExpenseSummary> {
    return this.http.get<ExpenseSummary>(`${this.apiUrl}/expenses/summary/overview`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getCategoryWiseExpenses(year: number, month: number): Observable<CategoryExpenses> {
    const params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());
    return this.http.get<CategoryExpenses>(`${this.apiUrl}/expenses/summary/categories`, { 
      headers: this.getAuthHeaders(),
      params: params
    }).pipe(catchError(this.handleError));
  }

  getCategoryWiseExpensesForDateRange(startDate: string, endDate: string): Observable<CategoryExpenses> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<CategoryExpenses>(`${this.apiUrl}/expenses/summary/categories/date-range`, { 
      headers: this.getAuthHeaders(),
      params: params
    }).pipe(catchError(this.handleError));
  }

  getUserCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/expenses/category`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getMonthlyTrends(monthsBack: number = 12): Observable<MonthlyTrend[]> {
    const params = new HttpParams().set('monthsBack', monthsBack.toString());
    return this.http.get<MonthlyTrend[]>(`${this.apiUrl}/expenses/trends/monthly`, { 
      headers: this.getAuthHeaders(),
      params: params
    }).pipe(catchError(this.handleError));
  }

  getTotalMonthlyExpenses(year: number, month: number): Observable<number> {
    const params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());
    return this.http.get<number>(`${this.apiUrl}/expenses/total/monthly`, { 
      headers: this.getAuthHeaders(),
      params: params
    }).pipe(catchError(this.handleError));
  }
}