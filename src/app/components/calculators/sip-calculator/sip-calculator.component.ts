import { Component } from '@angular/core';

type Frequency = 'monthly' | 'quarterly' | 'yearly';

@Component({
  selector: 'app-sip-calculator',
  templateUrl: './sip-calculator.component.html'
})
export class SipCalculatorComponent {
  investmentAmount = 10000;
  annualReturnRate = 12; // %
  timePeriodYears = 10;
  frequency: Frequency = 'monthly';

  totalInvested: number | null = null;
  totalMaturityAmount: number | null = null;
  totalInterestEarned: number | null = null;

  exampleOutput: any = null;

  calculate() {
    const m = this.getPeriodsPerYear(this.frequency);
    const P = this.investmentAmount;
    const years = this.timePeriodYears;
    const n = years * m;
    const r = (this.annualReturnRate / 100) / m;

    let maturity: number;
    if (r === 0) {
      maturity = P * n;
    } else {
      maturity = P * ((Math.pow(1 + r, n) - 1) / r);
    }

    const invested = P * n;
    const interest = maturity - invested;

    this.totalInvested = invested;
    this.totalMaturityAmount = maturity;
    this.totalInterestEarned = interest;

    this.exampleOutput = { P, m, years, n, r, maturity, invested, interest };
  }

  private getPeriodsPerYear(freq: Frequency): number {
    switch (freq) {
      case 'monthly': return 12;
      case 'quarterly': return 4;
      case 'yearly': return 1;
      default: return 12;
    }
  }

  format(value: number | null): string {
    return value != null ? value.toFixed(2) : '0.00';
  }
}
