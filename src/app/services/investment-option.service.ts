import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { 
  InvestmentOption, 
  InvestmentOptionSummary, 
  InvestmentRecommendation 
} from '../models/investment-option.model';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InvestmentOptionService {
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

//   `${this.apiUrl}/investment-options`
// `${this.apiUrl}/goals`

  createInvestmentOption(investmentOption: InvestmentOption): Observable<InvestmentOption> {
    return this.http.post<InvestmentOption>(`${this.apiUrl}/investment-options`, investmentOption, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getUserInvestmentOptions(): Observable<InvestmentOption[]> {
    return this.http.get<InvestmentOption[]>(`${this.apiUrl}/investment-options`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getInvestmentOptionById(id: number): Observable<InvestmentOption> {
    return this.http.get<InvestmentOption>(`${this.apiUrl}/investment-options/${id}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateInvestmentOption(id: number, investmentOption: InvestmentOption): Observable<InvestmentOption> {
    return this.http.put<InvestmentOption>(`${this.apiUrl}/investment-options/${id}`, investmentOption, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteInvestmentOption(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/investment-options/${id}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getInvestmentOptionsByCategory(category: string): Observable<InvestmentOption[]> {
    return this.http.get<InvestmentOption[]>(`${this.apiUrl}/investment-options/category/${category}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getInvestmentOptionsByRiskLevel(riskLevel: string): Observable<InvestmentOption[]> {
    return this.http.get<InvestmentOption[]>(`${this.apiUrl}/investment-options/risk-level/${riskLevel}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getInvestmentOptionsByLiquidity(liquidity: string): Observable<InvestmentOption[]> {
    return this.http.get<InvestmentOption[]>(`${this.apiUrl}/investment-options/liquidity/${liquidity}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getInvestmentOptionsByCAGRRange(minCAGR: number, maxCAGR: number): Observable<InvestmentOption[]> {
    const params = new HttpParams()
      .set('minCAGR', minCAGR.toString())
      .set('maxCAGR', maxCAGR.toString());
    return this.http.get<InvestmentOption[]>(`${this.apiUrl}/investment-options/cagr-range`, { 
      headers: this.getAuthHeaders(),
      params: params
    }).pipe(catchError(this.handleError));
  }

  getInvestmentOptionsSummary(): Observable<InvestmentOptionSummary> {
    return this.http.get<InvestmentOptionSummary>(`${this.apiUrl}/investment-options/summary/overview`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getRecommendedOptions(preferredRiskLevel: string, preferredLiquidity: string, minExpectedCAGR: number): Observable<InvestmentRecommendation[]> {
    const params = new HttpParams()
      .set('preferredRiskLevel', preferredRiskLevel)
      .set('preferredLiquidity', preferredLiquidity)
      .set('minExpectedCAGR', minExpectedCAGR.toString());
    return this.http.get<InvestmentRecommendation[]>(`${this.apiUrl}/investment-options/recommendations`, { 
      headers: this.getAuthHeaders(),
      params: params
    }).pipe(catchError(this.handleError));
  }
}