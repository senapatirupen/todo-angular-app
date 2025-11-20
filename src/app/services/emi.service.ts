import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EMI, EMISummary } from '../models/emi.model';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EMIService {
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

  createEMI(emi: EMI): Observable<EMI> {
    return this.http.post<EMI>(`${this.apiUrl}/emis`, emi, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getUserEMIs(): Observable<EMI[]> {
    return this.http.get<EMI[]>(`${this.apiUrl}/emis`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getEMIById(id: number): Observable<EMI> {
    return this.http.get<EMI>(`${this.apiUrl}/emis/${id}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateEMI(id: number, emi: EMI): Observable<EMI> {
    return this.http.put<EMI>(`${this.apiUrl}/emis/${id}`, emi, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteEMI(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/emis/${id}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  makePayment(id: number): Observable<EMI> {
    return this.http.post<EMI>(`${this.apiUrl}/emis/${id}/payment`, {}, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getTotalMonthlyEMI(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/emis/summary/total-monthly`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getEMISummary(): Observable<EMISummary> {
    return this.http.get<EMISummary>(`${this.apiUrl}/emis/summary/overview`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }
}