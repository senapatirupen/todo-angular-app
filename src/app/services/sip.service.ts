import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SIP, SIPSummary, SIPProgress, SIPProjection } from '../models/sip.model';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SIPService {
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

  createSIP(sip: SIP): Observable<SIP> {
    return this.http.post<SIP>(`${this.apiUrl}/sips`, sip, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getUserSIPs(): Observable<SIP[]> {
    return this.http.get<SIP[]>(`${this.apiUrl}/sips`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getSIPById(id: number): Observable<SIP> {
    return this.http.get<SIP>(`${this.apiUrl}/sips/${id}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateSIP(id: number, sip: SIP): Observable<SIP> {
    return this.http.put<SIP>(`${this.apiUrl}/sips/${id}`, sip, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteSIP(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/sips/${id}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getTotalMonthlyInvestment(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/sips/summary/total-monthly`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getSIPSummary(): Observable<SIPSummary> {
    return this.http.get<SIPSummary>(`${this.apiUrl}/sips/summary/overview`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getSIPProgress(id: number, monthsCompleted: number): Observable<SIPProgress> {
    const params = new HttpParams().set('monthsCompleted', monthsCompleted.toString());
    return this.http.get<SIPProgress>(`${this.apiUrl}/sips/${id}/progress`, { 
      headers: this.getAuthHeaders(),
      params: params
    }).pipe(catchError(this.handleError));
  }

  getSIPProjection(id: number): Observable<SIPProjection[]> {
    return this.http.get<SIPProjection[]>(`${this.apiUrl}/sips/${id}/projection`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }
}