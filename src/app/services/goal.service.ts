import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
    Goal,
    GoalSummary,
    GoalPlanning,
    UpcomingGoal,
    GoalProgress
} from '../models/goal.model';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class GoalService {
    private apiUrl = environment.apiUrl;

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

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

    createGoal(goal: Goal): Observable<Goal> {
        return this.http.post<Goal>(`${this.apiUrl}/goals`, goal, { headers: this.authService.getAuthHeaders() })
            .pipe(catchError(this.handleError));
    }

    getUserGoals(): Observable<Goal[]> {
        return this.http.get<Goal[]>(`${this.apiUrl}/goals`, { headers: this.authService.getAuthHeaders() })
            .pipe(catchError(this.handleError));
    }

    getGoalById(id: number): Observable<Goal> {
        return this.http.get<Goal>(`${this.apiUrl}/goals/${id}`, { headers: this.authService.getAuthHeaders() })
            .pipe(catchError(this.handleError));
    }

    updateGoal(id: number, goal: Goal): Observable<Goal> {
        return this.http.put<Goal>(`${this.apiUrl}/goals/${id}`, goal, { headers: this.authService.getAuthHeaders() })
            .pipe(catchError(this.handleError));
    }

    deleteGoal(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/goals/${id}`, { headers: this.authService.getAuthHeaders() })
            .pipe(catchError(this.handleError));
    }

    getGoalsByCategory(category: string): Observable<Goal[]> {
        return this.http.get<Goal[]>(`${this.apiUrl}/goals/category/${category}`, { headers: this.authService.getAuthHeaders() })
            .pipe(catchError(this.handleError));
    }

    getShortTermGoals(): Observable<Goal[]> {
        return this.http.get<Goal[]>(`${this.apiUrl}/goals/short-term`, { headers: this.authService.getAuthHeaders() })
            .pipe(catchError(this.handleError));
    }

    getMediumTermGoals(): Observable<Goal[]> {
        return this.http.get<Goal[]>(`${this.apiUrl}/goals/medium-term`, { headers: this.authService.getAuthHeaders() })
            .pipe(catchError(this.handleError));
    }

    getLongTermGoals(): Observable<Goal[]> {
        return this.http.get<Goal[]>(`${this.apiUrl}/goals/long-term`, { headers: this.authService.getAuthHeaders() })
            .pipe(catchError(this.handleError));
    }

    getRetirementGoals(): Observable<Goal[]> {
        return this.http.get<Goal[]>(`${this.apiUrl}/goals/retirement`, { headers: this.authService.getAuthHeaders() })
            .pipe(catchError(this.handleError));
    }

    getGoalsSummary(): Observable<GoalSummary> {
        return this.http.get<GoalSummary>(`${this.apiUrl}/goals/summary/overview`, { headers: this.authService.getAuthHeaders() })
            .pipe(catchError(this.handleError));
    }

    calculateGoalPlanning(id: number, expectedReturn: number): Observable<GoalPlanning> {
        const params = new HttpParams().set('expectedReturn', expectedReturn.toString());
        return this.http.get<GoalPlanning>(`${this.apiUrl}/goals/${id}/planning`, {
            params: params,
            headers: this.authService.getAuthHeaders()
        }).pipe(catchError(this.handleError));
    }

    getUpcomingGoals(yearsAhead: number = 5): Observable<UpcomingGoal[]> {
        const params = new HttpParams().set('yearsAhead', yearsAhead.toString());
        return this.http.get<UpcomingGoal[]>(`${this.apiUrl}/goals/upcoming`, {
            params: params,
            headers: this.authService.getAuthHeaders()
        }).pipe(catchError(this.handleError));
    }

    trackGoalProgress(id: number, currentSavings: number): Observable<GoalProgress> {
        const params = new HttpParams().set('currentSavings', currentSavings.toString());
        return this.http.post<GoalProgress>(`${this.apiUrl}/goals/${id}/track-progress`, {}, {
            params: params,
            headers: this.authService.getAuthHeaders()
        }).pipe(catchError(this.handleError));
    }
}