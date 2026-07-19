import { Component } from '@angular/core';

@Component({
  selector: 'app-inflation-calculator',
  templateUrl: './inflation-calculator.component.html'
})
export class InflationCalculatorComponent {

  // Inputs
  currentAnnualExpense: number = 300000;   // e.g. ₹3,00,000 per year
  inflationRate: number = 6;              // % per annum
  years: number = 20;

  // Outputs
  futureAnnualExpense: number | null = null;
  totalWithoutInflation: number | null = null;
  totalWithInflation: number | null = null;
  extraDueToInflation: number | null = null;

  calculate() {
    if (
      !this.currentAnnualExpense || this.currentAnnualExpense <= 0 ||
      this.inflationRate < 0 ||
      !this.years || this.years <= 0
    ) {
      this.futureAnnualExpense =
        this.totalWithoutInflation =
        this.totalWithInflation =
        this.extraDueToInflation = null;
      return;
    }

    const E0 = this.currentAnnualExpense;
    const n = this.years;
    const rateDecimal = this.inflationRate / 100;

    let futureAnnual: number;
    let totalInflation: number;
    let totalFlat: number;

    if (rateDecimal === 0) {
      // No inflation case
      futureAnnual = E0;
      totalFlat = E0 * n;
      totalInflation = totalFlat;
    } else {
      futureAnnual = E0 * Math.pow(1 + rateDecimal, n);
      totalInflation = E0 * (Math.pow(1 + rateDecimal, n) - 1) / rateDecimal;
      totalFlat = E0 * n;
    }

    const extra = totalInflation - totalFlat;

    this.futureAnnualExpense = futureAnnual;
    this.totalWithoutInflation = totalFlat;
    this.totalWithInflation = totalInflation;
    this.extraDueToInflation = extra;
  }

  formatAmount(value: number | null): string {
    return value != null ? value.toFixed(2) : '0.00';
  }
}
