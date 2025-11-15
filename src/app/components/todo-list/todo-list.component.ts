// components/todo-list/todo-list.component.ts
import { Component, OnInit } from '@angular/core';
import { TodoService } from '../../services/todo.service';
import { AuthService } from '../../services/auth.service';
import { Todo } from 'src/app/models/todo.model';
import { TodoRequest } from 'src/app/models/todo-request.model';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss']
})
export class TodoListComponent implements OnInit {
  todos: Todo[] = [];
  filteredTodos: Todo[] = [];
  filter: 'all' | 'completed' | 'pending' = 'all';
  newTodo: TodoRequest = { title: '', description: '' };
  isLoading: boolean = false;
  errorMessage: string = '';

  // Computed properties for counts
  get completedCount(): number {
    return this.todos.filter(t => t.completed).length;
  }

  get pendingCount(): number {
    return this.todos.filter(t => !t.completed).length;
  }

  get allCount(): number {
    return this.todos.length;
  }

  constructor(
    private todoService: TodoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadTodos();
  }

  loadTodos(): void {
    this.isLoading = true;
    this.todoService.getAllTodos().subscribe({
      next: (todos) => {
        this.todos = todos;
        this.applyFilter();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load todos';
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    switch (this.filter) {
      case 'completed':
        this.filteredTodos = this.todos.filter(todo => todo.completed);
        break;
      case 'pending':
        this.filteredTodos = this.todos.filter(todo => !todo.completed);
        break;
      default:
        this.filteredTodos = this.todos;
    }
  }

  onFilterChange(filter: 'all' | 'completed' | 'pending'): void {
    this.filter = filter;
    this.applyFilter();
  }

  createTodo(): void {
    if (this.newTodo.title.trim()) {
      this.todoService.createTodo(this.newTodo).subscribe({
        next: (todo) => {
          this.todos.unshift(todo);
          this.applyFilter();
          this.newTodo = { title: '', description: '' };
        },
        error: (error) => {
          this.errorMessage = 'Failed to create todo';
        }
      });
    }
  }

  toggleTodoCompletion(todo: Todo): void {
    if (todo.id) {
      this.todoService.toggleTodoCompletion(todo.id).subscribe({
        next: (updatedTodo) => {
          const index = this.todos.findIndex(t => t.id === updatedTodo.id);
          if (index !== -1) {
            this.todos[index] = updatedTodo;
            this.applyFilter();
          }
        },
        error: (error) => {
          this.errorMessage = 'Failed to update todo';
        }
      });
    }
  }

  deleteTodo(todo: Todo): void {
    if (todo.id && confirm('Are you sure you want to delete this todo?')) {
      this.todoService.deleteTodo(todo.id).subscribe({
        next: () => {
          this.todos = this.todos.filter(t => t.id !== todo.id);
          this.applyFilter();
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete todo';
        }
      });
    }
  }

  getCurrentUser() {
    return this.authService.getCurrentUser();
  }

  logout(): void {
    this.authService.logout();
  }
}