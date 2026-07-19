import { Component } from '@angular/core';

interface LoanInput {
  key: string;
  name: string;
  principal: number;
  annualRate: number;     // % p.a.
  tenureYears: number;    // years remaining
}

interface LoanResult {
  allocatedPartPayment: number;
  interestSaved: number;
  newOutstandingPrincipal: number;
  tenureReducedMonths: number;
  newTenureMonths: number;
  baselineTenureMonths: number;
}

@Component({
  selector: 'app-multi-loan-part-payment-calculator',
  templateUrl: './multi-loan-part-payment-calculator.component.html'
})
export class MultiLoanPartPaymentCalculatorComponent {

  // Lump sum source
  sourceName: string = 'Bonus';
  lumpSumAmount: number = 300000;

  // Loan inputs
  carLoan = {
    name: 'Car Loan',
    principal: 500000,
    annualRate: 9.5,
    tenureYears: 4
  };

  homeLoan = {
    name: 'Home Loan',
    principal: 3000000,
    annualRate: 8.0,
    tenureYears: 18
  };

  personalLoan = {
    name: 'Personal Loan',
    principal: 200000,
    annualRate: 14.0,
    tenureYears: 3
  };

  // Results keyed by loan type
  results: { [key: string]: LoanResult } | null = null;
  totalInterestSaved: number | null = null;

  calculate() {
    if (!this.lumpSumAmount || this.lumpSumAmount <= 0) {
      this.results = null;
      this.totalInterestSaved = null;
      return;
    }

    const loans: LoanInput[] = [
  {
    key: 'car',
    name: this.carLoan.name,
    principal: this.carLoan.principal,
    annualRate: this.carLoan.annualRate,
    tenureYears: this.carLoan.tenureYears
  },
  {
    key: 'home',
    name: this.homeLoan.name,
    principal: this.homeLoan.principal,
    annualRate: this.homeLoan.annualRate,
    tenureYears: this.homeLoan.tenureYears
  },
  {
    key: 'personal',
    name: this.personalLoan.name,
    principal: this.personalLoan.principal,
    annualRate: this.personalLoan.annualRate,
    tenureYears: this.personalLoan.tenureYears
  }
].filter(l => l.principal > 0 && l.tenureYears > 0);

    if (loans.length === 0) {
      this.results = null;
      this.totalInterestSaved = null;
      return;
    }

    // --- Step 1: Pro-rata weights (principal × rate) ---
    let totalWeight = 0;
    const weights: { [key: string]: number } = {};

    loans.forEach(loan => {
      const w = loan.principal * loan.annualRate;
      weights[loan.key] = w;
      totalWeight += w;
    });

    if (totalWeight === 0) {
      this.results = null;
      this.totalInterestSaved = null;
      return;
    }

    // Initial allocation
    const allocations: { [key: string]: number } = {};
    loans.forEach(loan => {
      const share = (weights[loan.key] / totalWeight) * this.lumpSumAmount;
      // don't allocate more than outstanding principal
      allocations[loan.key] = Math.min(share, loan.principal);
    });

    // OPTIONAL: we could re-distribute leftover, but keeping it simple for now.

    // --- Step 2: For each loan, compute interest saved & tenure reduction ---
    const results: { [key: string]: LoanResult } = {};
    let totalInterestSaved = 0;

    loans.forEach(loan => {
      const partPayment = allocations[loan.key];

      const baseline = this.simulateLoan(
        loan.principal,
        loan.annualRate,
        loan.tenureYears,
        0 // no part payment
      );

      const withPP = this.simulateLoan(
        loan.principal,
        loan.annualRate,
        loan.tenureYears,
        partPayment
      );

      const interestSaved = baseline.totalInterest - withPP.totalInterest;
      totalInterestSaved += interestSaved;

      const newOutstanding = Math.max(loan.principal - partPayment, 0);
      const tenureReduced = baseline.months - withPP.months;

      results[loan.key] = {
        allocatedPartPayment: partPayment,
        interestSaved,
        newOutstandingPrincipal: newOutstanding,
        tenureReducedMonths: tenureReduced,
        newTenureMonths: withPP.months,
        baselineTenureMonths: baseline.months
      };
    });

    this.results = results;
    this.totalInterestSaved = totalInterestSaved;
  }

  /**
   * Simulate loan amortization month-by-month.
   * partPayment is applied once in the first month in addition to the EMI principal.
   */
  private simulateLoan(
    principal: number,
    annualRate: number,
    tenureYears: number,
    partPayment: number
  ): { totalInterest: number; months: number; emi: number } {

    const rMonthly = (annualRate / 100) / 12;
    const nMonths = Math.round(tenureYears * 12);

    let emi: number;
    if (rMonthly === 0) {
      emi = principal / nMonths;
    } else {
      const pow = Math.pow(1 + rMonthly, nMonths);
      emi = principal * rMonthly * pow / (pow - 1);
    }

    let balance = principal;
    let totalInterest = 0;
    let months = 0;

    while (balance > 0 && months < nMonths + 600) { // some buffer
      months++;

      const interest = balance * rMonthly;
      let principalComponent = emi - interest;

      if (principalComponent <= 0) {
        // EMI too small (shouldn't happen with normal inputs)
        break;
      }

      // apply part payment in first month (one-time)
      let extra = 0;
      if (months === 1 && partPayment > 0) {
        extra = partPayment;
      }

      const totalPrincipalPaid = principalComponent + extra;
      if (totalPrincipalPaid > balance) {
        principalComponent = balance; // cap to avoid negative balance
      }

      totalInterest += interest;
      balance -= totalPrincipalPaid;

      if (balance <= 0) {
        balance = 0;
        break;
      }
    }

    return { totalInterest, months, emi };
  }

  formatAmount(value: number | null): string {
    return value != null ? value.toFixed(2) : '0.00';
  }

  formatTenure(months: number): string {
    if (!months || months < 0) return '-';
    const yrs = Math.floor(months / 12);
    const mos = months % 12;
    if (yrs === 0) return `${mos} months`;
    if (mos === 0) return `${yrs} years`;
    return `${yrs} years ${mos} months`;
  }
}
