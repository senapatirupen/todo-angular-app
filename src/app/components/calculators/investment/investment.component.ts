import { Component } from '@angular/core';

type CalculatorType = 'sip' | 'lumpsum' | 'rule72' | 'homeLoanPartPayment' | 'goalMonthlySaving' | 'emi' | 'inflation' | 'multiLoanPartPayment';

@Component({
    selector: 'app-investment',
    templateUrl: './investment.component.html',
  styleUrls: ['./investment.component.scss']
})
export class InvestmentComponent {
    selectedCalculator: CalculatorType = 'sip'; // default

    selectCalculator(type: CalculatorType) {
        this.selectedCalculator = type;
    }
}
