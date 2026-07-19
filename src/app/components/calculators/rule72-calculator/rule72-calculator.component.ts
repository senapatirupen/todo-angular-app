import { Component } from '@angular/core';

type Rule72Mode = 'yearsFromRate' | 'rateFromYears';

@Component({
  selector: 'app-rule72-calculator',
  templateUrl: './rule72-calculator.component.html'
})
export class Rule72CalculatorComponent {
  mode: Rule72Mode = 'yearsFromRate';

  annualReturnRate: number | null = 12;  // for mode: yearsFromRate
  yearsToDouble: number | null = 6;      // for mode: rateFromYears

  result: number | null = null;

  calculate() {
    this.result = null;

    if (this.mode === 'yearsFromRate') {
      if (!this.annualReturnRate || this.annualReturnRate <= 0) {
        return;
      }
      // Years to double ≈ 72 / rate
      this.result = 72 / this.annualReturnRate;
    } else {
      if (!this.yearsToDouble || this.yearsToDouble <= 0) {
        return;
      }
      // Required rate ≈ 72 / years
      this.result = 72 / this.yearsToDouble;
    }
  }

  format(value: number | null): string {
    return value != null ? value.toFixed(2) : '0.00';
  }
}
