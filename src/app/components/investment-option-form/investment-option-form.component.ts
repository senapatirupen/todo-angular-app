import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InvestmentOptionService } from '../../services/investment-option.service';
import { InvestmentOption } from '../../models/investment-option.model';

@Component({
    selector: 'app-investment-option-form',
    templateUrl: './investment-option-form.component.html',
    styleUrls: ['./investment-option-form.component.scss']
})
export class InvestmentOptionFormComponent implements OnInit {
    investmentOptionForm: FormGroup;
    isEdit = false;
    investmentOptionId?: number;
    isLoading = false;
    errorMessage = '';
    successMessage = '';

    // Dropdown options
    categories = ['EQUITY', 'FIXED_INCOME', 'REAL_ESTATE', 'COMMODITIES', 'ALTERNATIVE'];
    riskLevels = ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'];
    liquidityLevels = ['HIGH', 'MEDIUM', 'LOW'];

    constructor(
        private fb: FormBuilder,
        private investmentOptionService: InvestmentOptionService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.investmentOptionForm = this.createForm();
    }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.isEdit = true;
                this.investmentOptionId = +params['id'];
                this.loadInvestmentOption(this.investmentOptionId);
            }
        });
    }

    createForm(): FormGroup {
        return this.fb.group({
            name: ['', [Validators.required, Validators.maxLength(100)]],
            category: ['', Validators.required],
            minCAGR: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
            maxCAGR: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
            riskLevel: ['', Validators.required],
            liquidity: ['', Validators.required],
            taxEfficiency: [''],
            notes: ['']
        }, { validators: this.cagrValidator });
    }

    cagrValidator(form: FormGroup) {
        const minCAGR = form.get('minCAGR')?.value;
        const maxCAGR = form.get('maxCAGR')?.value;

        if (minCAGR !== null && maxCAGR !== null && minCAGR > maxCAGR) {
            return { cagrRange: true };
        }

        return null;
    }

    loadInvestmentOption(id: number): void {
        this.isLoading = true;
        this.investmentOptionService.getInvestmentOptionById(id).subscribe({
            next: (investmentOption) => {
                this.investmentOptionForm.patchValue({
                    name: investmentOption.name,
                    category: investmentOption.category,
                    minCAGR: investmentOption.minCAGR,
                    maxCAGR: investmentOption.maxCAGR,
                    riskLevel: investmentOption.riskLevel,
                    liquidity: investmentOption.liquidity,
                    taxEfficiency: investmentOption.taxEfficiency || '',
                    notes: investmentOption.notes || ''
                });
                this.isLoading = false;
            },
            error: (error) => {
                this.errorMessage = 'Failed to load investment option. Please try again.';
                this.isLoading = false;
                console.error('Error loading investment option:', error);
            }
        });
    }

    onSubmit(): void {
        if (this.investmentOptionForm.valid) {
            this.isLoading = true;
            this.errorMessage = '';
            this.successMessage = '';

            const investmentOption: InvestmentOption = this.investmentOptionForm.value;

            const operation = this.isEdit && this.investmentOptionId
                ? this.investmentOptionService.updateInvestmentOption(this.investmentOptionId, investmentOption)
                : this.investmentOptionService.createInvestmentOption(investmentOption);

            operation.subscribe({
                next: (savedInvestmentOption) => {
                    this.isLoading = false;
                    this.successMessage = this.isEdit
                        ? 'Investment option updated successfully!'
                        : 'Investment option created successfully!';

                    setTimeout(() => {
                        this.router.navigate(['/investment-options']);
                    }, 1500);
                },
                error: (error) => {
                    this.isLoading = false;
                    this.errorMessage = this.isEdit
                        ? 'Failed to update investment option. Please try again.'
                        : 'Failed to create investment option. Please try again.';
                    console.error('Error saving investment option:', error);
                }
            });
        } else {
            this.markFormGroupTouched();
        }
    }

    markFormGroupTouched(): void {
        Object.keys(this.investmentOptionForm.controls).forEach(key => {
            const control = this.investmentOptionForm.get(key);
            control?.markAsTouched();
        });
    }

    onCancel(): void {
        if (this.investmentOptionForm.dirty) {
            if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
                this.router.navigate(['/investment-options']);
            }
        } else {
            this.router.navigate(['/investment-options']);
        }
    }

    getAverageCAGR(): number {
        const minCAGR = this.investmentOptionForm.get('minCAGR')?.value;
        const maxCAGR = this.investmentOptionForm.get('maxCAGR')?.value;

        if (minCAGR !== null && maxCAGR !== null) {
            return (minCAGR + maxCAGR) / 2;
        }
        return 0;
    }

    // Getters for easy access in template
    get name() { return this.investmentOptionForm.get('name'); }
    get category() { return this.investmentOptionForm.get('category'); }
    get minCAGR() { return this.investmentOptionForm.get('minCAGR'); }
    get maxCAGR() { return this.investmentOptionForm.get('maxCAGR'); }
    get riskLevel() { return this.investmentOptionForm.get('riskLevel'); }
    get liquidity() { return this.investmentOptionForm.get('liquidity'); }
    get taxEfficiency() { return this.investmentOptionForm.get('taxEfficiency'); }
    get notes() { return this.investmentOptionForm.get('notes'); }

    // Add to InvestmentOptionListComponent and InvestmentOptionFormComponent
    getCategoryDisplayName(category: string): string {
        switch (category) {
            case 'EQUITY': return 'Equity';
            case 'FIXED_INCOME': return 'Fixed Income';
            case 'REAL_ESTATE': return 'Real Estate';
            case 'COMMODITIES': return 'Commodities';
            case 'ALTERNATIVE': return 'Alternative';
            default: return category;
        }
    }

    getCategoryIcon(category: string): string {
        switch (category) {
            case 'EQUITY': return 'fa-chart-line';
            case 'FIXED_INCOME': return 'fa-hand-holding-usd';
            case 'REAL_ESTATE': return 'fa-home';
            case 'COMMODITIES': return 'fa-gem';
            case 'ALTERNATIVE': return 'fa-lightbulb';
            default: return 'fa-chart-pie';
        }
    }

    getRiskColor(riskLevel: string): string {
        switch (riskLevel) {
            case 'LOW': return 'success';
            case 'MEDIUM': return 'warning';
            case 'HIGH': return 'danger';
            case 'VERY_HIGH': return 'dark';
            default: return 'secondary';
        }
    }

    getLiquidityIcon(liquidity: string): string {
        switch (liquidity) {
            case 'HIGH': return 'fa-tachometer-alt-fast';
            case 'MEDIUM': return 'fa-tachometer-alt-average';
            case 'LOW': return 'fa-tachometer-alt-slow';
            default: return 'fa-tachometer-alt';
        }
    }
}