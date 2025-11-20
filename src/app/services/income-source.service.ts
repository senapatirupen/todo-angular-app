import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { 
  IncomeSource, 
  IncomeSourceSummary, 
  IncomeProgression, 
  YearlyIncome,
  FastestGrowingIncome,
  YearlyIncomeSummary 
} from '../models/income-source.model';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class IncomeSourceService {
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

  createIncomeSource(incomeSource: IncomeSource): Observable<IncomeSource> {
    return this.http.post<IncomeSource>(`${this.apiUrl}/income-sources`, incomeSource, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getUserIncomeSources(): Observable<IncomeSource[]> {
    return this.http.get<IncomeSource[]>(`${this.apiUrl}/income-sources`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getIncomeSourceById(id: number): Observable<IncomeSource> {
    return this.http.get<IncomeSource>(`${this.apiUrl}/income-sources/${id}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateIncomeSource(id: number, incomeSource: IncomeSource): Observable<IncomeSource> {
    return this.http.put<IncomeSource>(`${this.apiUrl}/income-sources/${id}`, incomeSource, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteIncomeSource(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/income-sources/${id}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getIncomeSourceSummary(): Observable<IncomeSourceSummary> {
    return this.http.get<IncomeSourceSummary>(`${this.apiUrl}/income-sources/summary/overview`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getIncomeProgression(id: number): Observable<IncomeProgression[]> {
    return this.http.get<IncomeProgression[]>(`${this.apiUrl}/income-sources/${id}/progression`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getIncomeForYear(id: number, targetYear: number): Observable<YearlyIncome> {
    const params = new HttpParams().set('targetYear', targetYear.toString());
    return this.http.get<YearlyIncome>(`${this.apiUrl}/income-sources/${id}/yearly-income`, { 
      headers: this.getAuthHeaders(),
      params: params
    }).pipe(catchError(this.handleError));
  }

  getFastestGrowingIncomes(limit: number = 5): Observable<FastestGrowingIncome[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<FastestGrowingIncome[]>(`${this.apiUrl}/income-sources/fastest-growing`, { 
      headers: this.getAuthHeaders(),
      params: params
    }).pipe(catchError(this.handleError));
  }

  getYearlyIncomeSummary(targetYear: number): Observable<YearlyIncomeSummary> {
    const params = new HttpParams().set('targetYear', targetYear.toString());
    return this.http.get<YearlyIncomeSummary>(`${this.apiUrl}/income-sources/yearly-summary`, { 
      headers: this.getAuthHeaders(),
      params: params
    }).pipe(catchError(this.handleError));
  }
}