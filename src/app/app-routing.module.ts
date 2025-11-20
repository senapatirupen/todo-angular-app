// app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { TodoListComponent } from './components/todo-list/todo-list.component';
import { AuthGuard } from './guards/auth.guard';
import { GoalListComponent } from './components/goal-list/goal-list.component';
import { GoalFormComponent } from './components/goal-form/goal-form.component';
import { InvestmentOptionListComponent } from './components/investment-option-list/investment-option-list.component';
import { InvestmentOptionFormComponent } from './components/investment-option-form/investment-option-form.component';
import { IncomeSourceListComponent } from './components/income-source-list/income-source-list.component';
import { IncomeSourceFormComponent } from './components/income-source-form/income-source-form.component';
import { LumpSumListComponent } from './components/lumpsum-list/lumpsum-list.component';
import { LumpSumFormComponent } from './components/lumpsum-form/lumpsum-form.component';
import { SIPListComponent } from './components/sip-list/sip-list.component';
import { SIPFormComponent } from './components/sip-form/sip-form.component';
import { EMIListComponent } from './components/emi-list/emi-list.component';
import { EMIFormComponent } from './components/emi-form/emi-form.component';
import { ExpenseListComponent } from './components/expense-list/expense-list.component';
import { ExpenseFormComponent } from './components/expense-form/expense-form.component';

const routes: Routes = [
  { path: '', redirectTo: '/todos', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'todos', component: TodoListComponent, canActivate: [AuthGuard] },
  { path: 'goals', component: GoalListComponent, canActivate: [AuthGuard] },
  { path: 'goals/new', component: GoalFormComponent, canActivate: [AuthGuard] },
  { path: 'investment-options', component: InvestmentOptionListComponent, canActivate: [AuthGuard] },
  { path: 'investment-options/new', component: InvestmentOptionFormComponent, canActivate: [AuthGuard] },
  { path: 'income-sources', component: IncomeSourceListComponent, canActivate: [AuthGuard] },
  { path: 'income-sources/new', component: IncomeSourceFormComponent, canActivate: [AuthGuard] },
  { path: 'lump-sums', component: LumpSumListComponent, canActivate: [AuthGuard] },
  { path: 'lump-sums/new', component: LumpSumFormComponent, canActivate: [AuthGuard] },
  { path: 'sips', component: SIPListComponent, canActivate: [AuthGuard] },
  { path: 'sips/new', component: SIPFormComponent, canActivate: [AuthGuard] },
  { path: 'emis', component: EMIListComponent, canActivate: [AuthGuard] },
  { path: 'emis/new', component: EMIFormComponent, canActivate: [AuthGuard] },
  { path: 'expenses', component: ExpenseListComponent, canActivate: [AuthGuard] },
  { path: 'expenses/new', component: ExpenseFormComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/todos' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }