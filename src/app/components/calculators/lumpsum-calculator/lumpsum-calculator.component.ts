import { Component } from '@angular/core';

@Component({
  selector: 'app-lumpsum-calculator',
  templateUrl: './lumpsum-calculator.component.html'
})
export class LumpsumCalculatorComponent {
  investmentAmount = 100000;
  annualReturnRate = 12; // %
  timePeriodYears = 10;

  totalInvested: number | null = null;
  totalMaturityAmount: number | null = null;
  totalInterestEarned: number | null = null;

  calculate() {
    if (
      !this.investmentAmount ||
      this.investmentAmount <= 0 ||
      !this.timePeriodYears ||
      this.timePeriodYears <= 0 ||
      this.annualReturnRate < 0
    ) {
      this.totalInvested = this.totalMaturityAmount = this.totalInterestEarned = null;
      return;
    }

    const P = this.investmentAmount;
    const r = this.annualReturnRate / 100;
    const n = this.timePeriodYears;

    const maturity = P * Math.pow(1 + r, n);
    const invested = P;
    const interest = maturity - invested;

    this.totalInvested = invested;
    this.totalMaturityAmount = maturity;
    this.totalInterestEarned = interest;
  }

  format(value: number | null): string {
    return value != null ? value.toFixed(2) : '0.00';
  }
}
