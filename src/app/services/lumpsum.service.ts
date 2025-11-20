import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LumpSum, LumpSumSummary, LumpSumProgress, LumpSumProjection, TopPerformer } from '../models/lumpsum.model';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class LumpSumService {
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

    createLumpSum(lumpSum: LumpSum): Observable<LumpSum> {
        return this.http.post<LumpSum>(`${this.apiUrl}/lump-sums`, lumpSum, { headers: this.getAuthHeaders() })
            .pipe(catchError(this.handleError));
    }

    getUserLumpSums(): Observable<LumpSum[]> {
        return this.http.get<LumpSum[]>(`${this.apiUrl}/lump-sums`, { headers: this.getAuthHeaders() })
            .pipe(catchError(this.handleError));
    }

    getLumpSumById(id: number): Observable<LumpSum> {
        return this.http.get<LumpSum>(`${this.apiUrl}/lump-sums/${id}`, { headers: this.getAuthHeaders() })
            .pipe(catchError(this.handleError));
    }

    updateLumpSum(id: number, lumpSum: LumpSum): Observable<LumpSum> {
        return this.http.put<LumpSum>(`${this.apiUrl}/lump-sums/${id}`, lumpSum, { headers: this.getAuthHeaders() })
            .pipe(catchError(this.handleError));
    }

    deleteLumpSum(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/lump-sums/${id}`, { headers: this.getAuthHeaders() })
            .pipe(catchError(this.handleError));
    }

    getLumpSumSummary(): Observable<LumpSumSummary> {
        return this.http.get<LumpSumSummary>(`${this.apiUrl}/lump-sums/summary/overview`, { headers: this.getAuthHeaders() })
            .pipe(catchError(this.handleError));
    }

    getLumpSumProgress(id: number, yearsCompleted: number): Observable<LumpSumProgress> {
        const params = new HttpParams().set('yearsCompleted', yearsCompleted.toString());
        return this.http.get<LumpSumProgress>(`${this.apiUrl}/lump-sums/${id}/progress`, {
            headers: this.getAuthHeaders(),
            params: params
        }).pipe(catchError(this.handleError));
    }

    getLumpSumProjection(id: number): Observable<LumpSumProjection[]> {
        return this.http.get<LumpSumProjection[]>(`${this.apiUrl}/lump-sums/${id}/projection`, { headers: this.getAuthHeaders() })
            .pipe(catchError(this.handleError));
    }

    getTopPerformingInvestments(limit: number = 5): Observable<TopPerformer[]> {
        const params = new HttpParams().set('limit', limit.toString());
        return this.http.get<TopPerformer[]>(`${this.apiUrl}/lump-sums/top-performing`, {
            headers: this.getAuthHeaders(),
            params: params
        }).pipe(catchError(this.handleError));
    }
}