import { Component } from '@angular/core';

@Component({
  selector: 'app-home-loan-part-payment-calculator',
  templateUrl: './home-loan-part-payment-calculator.component.html'
})
export class HomeLoanPartPaymentCalculatorComponent {

  // Inputs
  outstandingPrincipal: number = 3000000;   // 30L
  annualInterestRate: number = 8.0;        // % per annum
  tenureLeftYears: number = 20;            // years remaining
  partPaymentPerYear: number = 100000;     // extra payment per year
  partPaymentYears: number = 5;            // do this for 5 years

  // Outputs
  currentEmi: number | null = null;
  currentTotalInterest: number | null = null;
  currentTenureMonths: number | null = null;

  newOutstandingAfterYears: number | null = null;
  newTotalInterestWithPartPay: number | null = null;
  interestSaved: number | null = null;
  newTenureMonths: number | null = null;
  tenureReducedMonths: number | null = null;

  calculate() {
    if (
      !this.outstandingPrincipal || this.outstandingPrincipal <= 0 ||
      !this.annualInterestRate || this.annualInterestRate < 0 ||
      !this.tenureLeftYears || this.tenureLeftYears <= 0
    ) {
      return;
    }

    const P0 = this.outstandingPrincipal;
    const rAnnual = this.annualInterestRate / 100;
    const rMonthly = rAnnual / 12;
    const nMonths = Math.round(this.tenureLeftYears * 12);

    // EMI calculation (standard reducing balance)
    let emi: number;
    if (rMonthly === 0) {
      emi = P0 / nMonths;
    } else {
      const pow = Math.pow(1 + rMonthly, nMonths);
      emi = P0 * rMonthly * pow / (pow - 1);
    }

    this.currentEmi = emi;
    this.currentTenureMonths = nMonths;

    // 1) Baseline: no part payment – total interest remaining
    let balanceNoPP = P0;
    let totalInterestNoPP = 0;

    for (let m = 1; m <= nMonths; m++) {
      const interest = balanceNoPP * rMonthly;
      const principalComp = emi - interest;
      totalInterestNoPP += interest;
      balanceNoPP -= principalComp;
      if (balanceNoPP <= 0) {
        break;
      }
    }
    this.currentTotalInterest = totalInterestNoPP;

    // 2) With part payments
    let balancePP = P0;
    let totalInterestPP = 0;
    let monthsWithPP = 0;
    const totalPartPayMonths = this.partPaymentYears * 12;

    let outstandingAfterYears = 0;

    while (balancePP > 0 && monthsWithPP < 1000 * 12) { // safety cap
      monthsWithPP++;
      const interest = balancePP * rMonthly;
      const principalComp = emi - interest;

      // sanity check: EMI must cover interest; otherwise break
      if (principalComp <= 0) {
        // unrealistic case, stop to avoid infinite loop
        break;
      }

      totalInterestPP += interest;
      balancePP -= principalComp;

      // Apply part payment at the end of each year (month 12, 24, 36, ...)
      if (
        monthsWithPP % 12 === 0 &&
        monthsWithPP <= totalPartPayMonths &&
        this.partPaymentPerYear > 0 &&
        balancePP > 0
      ) {
        const extra = Math.min(this.partPaymentPerYear, balancePP);
        balancePP -= extra;
      }

      if (monthsWithPP === totalPartPayMonths) {
        outstandingAfterYears = Math.max(balancePP, 0);
      }

      if (balancePP <= 0) {
        balancePP = 0;
        break;
      }
    }

    this.newOutstandingAfterYears = outstandingAfterYears;
    this.newTotalInterestWithPartPay = totalInterestPP;
    this.interestSaved = totalInterestNoPP - totalInterestPP;
    this.newTenureMonths = monthsWithPP;
    this.tenureReducedMonths = nMonths - monthsWithPP;
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
