// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { TodoListComponent } from './components/todo-list/todo-list.component';
import { TodoItemComponent } from './components/todo-item/todo-item.component';

import { JwtInterceptor } from './interceptors/jwt.interceptor';
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
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    TodoListComponent,
    TodoItemComponent,
    GoalListComponent,
    GoalFormComponent,
    InvestmentOptionListComponent,
    InvestmentOptionFormComponent,
    IncomeSourceListComponent,
    IncomeSourceFormComponent,
    LumpSumListComponent,
    LumpSumFormComponent,
    SIPListComponent,
    SIPFormComponent,
    EMIListComponent,
    EMIFormComponent,
    ExpenseListComponent,
    ExpenseFormComponent,
    HeaderComponent,
    FooterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }