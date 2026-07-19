import { Component } from '@angular/core';

@Component({
  selector: 'app-emi-calculator',
  templateUrl: './emi-calculator.component.html'
})
export class EmiCalculatorComponent {

  // Inputs
  loanAmount: number = 3000000;      // 30L
  annualInterestRate: number = 8.0;  // % p.a.
  tenureYears: number = 20;          // years

  // Outputs
  emiAmount: number | null = null;
  totalInterestPaid: number | null = null;
  totalAmountPaid: number | null = null;
  principalRepaid5Years: number | null = null;
  principalRepaid10Years: number | null = null;

  calculate() {
    if (
      !this.loanAmount || this.loanAmount <= 0 ||
      this.annualInterestRate < 0 ||
      !this.tenureYears || this.tenureYears <= 0
    ) {
      this.resetOutputs();
      return;
    }

    const P = this.loanAmount;
    const rAnnual = this.annualInterestRate / 100;
    const rMonthly = rAnnual / 12;           // monthly rate
    const nMonths = Math.round(this.tenureYears * 12);

    // EMI calculation
    let emi: number;
    if (rMonthly === 0) {
      emi = P / nMonths;
    } else {
      const pow = Math.pow(1 + rMonthly, nMonths);
      emi = P * rMonthly * pow / (pow - 1);
    }
    this.emiAmount = emi;

    // Amortization simulation
    let balance = P;
    let totalInterest = 0;
    let principalRepaid = 0;

    let principalTill5Years = 0;
    let principalTill10Years = 0;

    for (let m = 1; m <= nMonths; m++) {
      const interestComponent = balance * rMonthly;
      let principalComponent = emi - interestComponent;

      // Safety (last EMI might be slightly different due to rounding)
      if (principalComponent > balance) {
        principalComponent = balance;
      }

      totalInterest += interestComponent;
      principalRepaid += principalComponent;
      balance -= principalComponent;

      if (m <= 5 * 12) {
        principalTill5Years += principalComponent;
      }
      if (m <= 10 * 12) {
        principalTill10Years += principalComponent;
      }

      if (balance <= 0) {
        break;
      }
    }

    this.totalInterestPaid = totalInterest;
    this.totalAmountPaid = P + totalInterest;

    // If tenure is less than 5 or 10 years, just use what was actually repaid
    this.principalRepaid5Years = principalTill5Years;
    this.principalRepaid10Years = principalTill10Years;
  }

  private resetOutputs() {
    this.emiAmount = null;
    this.totalInterestPaid = null;
    this.totalAmountPaid = null;
    this.principalRepaid5Years = null;
    this.principalRepaid10Years = null;
  }

  formatAmount(value: number | null): string {
    return value != null ? value.toFixed(2) : '0.00';
  }
}
