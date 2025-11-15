// services/todo.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Todo } from '../models/todo.model';
import { TodoRequest } from '../models/todo-request.model';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAllTodos(): Observable<Todo[]> {
    return this.http.get<Todo[]>(`${this.apiUrl}/todos`);
  }

  getCompletedTodos(): Observable<Todo[]> {
    return this.http.get<Todo[]>(`${this.apiUrl}/todos/completed`);
  }

  getPendingTodos(): Observable<Todo[]> {
    return this.http.get<Todo[]>(`${this.apiUrl}/todos/pending`);
  }

  createTodo(todoRequest: TodoRequest): Observable<Todo> {
    return this.http.post<Todo>(`${this.apiUrl}/todos`, todoRequest);
  }

  updateTodo(id: number, todoRequest: TodoRequest): Observable<Todo> {
    return this.http.put<Todo>(`${this.apiUrl}/todos/${id}`, todoRequest);
  }

  toggleTodoCompletion(id: number): Observable<Todo> {
    return this.http.patch<Todo>(`${this.apiUrl}/todos/${id}/toggle`, {});
  }

  deleteTodo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/todos/${id}`);
  }
}