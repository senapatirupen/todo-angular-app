import { Component } from '@angular/core';

@Component({
  selector: 'app-goal-monthly-savings-calculator',
  templateUrl: './goal-monthly-savings-calculator.component.html'
})
export class GoalMonthlySavingsCalculatorComponent {

  // Inputs
  goalAmount: number = 1000000;        // required goal amount (FV)
  annualInterestRate: number = 12;     // % p.a.
  yearsToGoal: number = 10;            // years

  // Outputs
  monthlyInvestment: number | null = null;
  totalTenureMonths: number | null = null;
  totalInvested: number | null = null;
  interestEarned: number | null = null;
  totalAmountReceived: number | null = null;

  calculate() {
    if (
      !this.goalAmount || this.goalAmount <= 0 ||
      this.annualInterestRate < 0 ||
      !this.yearsToGoal || this.yearsToGoal <= 0
    ) {
      this.monthlyInvestment = this.totalTenureMonths =
        this.totalInvested = this.interestEarned = this.totalAmountReceived = null;
      return;
    }

    const FV = this.goalAmount;
    const rAnnual = this.annualInterestRate / 100;
    const rMonthly = rAnnual / 12;
    const n = Math.round(this.yearsToGoal * 12);

    let P: number; // monthly investment

    if (rMonthly === 0) {
      P = FV / n;
    } else {
      const pow = Math.pow(1 + rMonthly, n);
      const factor = (pow - 1) / rMonthly;
      P = FV / factor;
    }

    const invested = P * n;
    const interest = FV - invested;

    this.monthlyInvestment = P;
    this.totalTenureMonths = n;
    this.totalInvested = invested;
    this.interestEarned = interest;
    this.totalAmountReceived = FV; // same as goal
  }

  formatAmount(value: number | null): string {
    return value != null ? value.toFixed(2) : '0.00';
  }

  formatTenure(months: number | null): string {
    if (months == null) return '-';
    const yrs = Math.floor(months / 12);
    const mos = months % 12;
    if (yrs === 0) return `${mos} months`;
    if (mos === 0) return `${yrs} years`;
    return `${yrs} years ${mos} months`;
  }
}
