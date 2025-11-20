import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LumpSumService } from '../../services/lumpsum.service';
import { LumpSum } from '../../models/lumpsum.model';

@Component({
    selector: 'app-lumpsum-form',
    templateUrl: './lumpsum-form.component.html',
    styleUrls: ['./lumpsum-form.component.scss']
})
export class LumpSumFormComponent implements OnInit {
    lumpSumForm: FormGroup;
    isEdit = false;
    lumpSumId?: number;
    isLoading = false;
    errorMessage = '';
    successMessage = '';
    calculatedValues: any = {};

    constructor(
        private fb: FormBuilder,
        private lumpSumService: LumpSumService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.lumpSumForm = this.createForm();
    }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.isEdit = true;
                this.lumpSumId = +params['id'];
                this.loadLumpSum(this.lumpSumId);
            }
        });

        // Recalculate when form values change
        this.lumpSumForm.valueChanges.subscribe(() => {
            this.calculateLumpSum();
        });
    }

    createForm(): FormGroup {
        return this.fb.group({
            investmentName: ['', [Validators.required, Validators.maxLength(100)]],
            principalAmount: [null, [Validators.required, Validators.min(100), Validators.max(100000000)]],
            duration: [null, [Validators.required, Validators.min(1), Validators.max(50)]], // years
            expectedReturn: [null, [Validators.required, Validators.min(1), Validators.max(50)]]
        });
    }

    loadLumpSum(id: number): void {
        this.isLoading = true;
        this.lumpSumService.getLumpSumById(id).subscribe({
            next: (lumpSum) => {
                this.lumpSumForm.patchValue({
                    investmentName: lumpSum.investmentName,
                    principalAmount: lumpSum.principalAmount,
                    duration: lumpSum.duration,
                    expectedReturn: lumpSum.expectedReturn
                });
                this.calculatedValues = {
                    futureValue: lumpSum.futureValue,
                    totalInterest: lumpSum.totalInterest
                };
                this.isLoading = false;
            },
            error: (error) => {
                this.errorMessage = 'Failed to load lump sum investment. Please try again.';
                this.isLoading = false;
                console.error('Error loading lump sum:', error);
            }
        });
    }

    calculateLumpSum(): void {
        const formValue = this.lumpSumForm.value;
        if (formValue.principalAmount && formValue.duration && formValue.expectedReturn) {
            const P = formValue.principalAmount;
            const n = formValue.duration;
            const r = formValue.expectedReturn / 100;

            // Compound interest formula: FV = P * (1 + r)^n
            const futureValue = P * Math.pow(1 + r, n);
            const totalInterest = futureValue - P;
            const returnPercentage = (totalInterest / P) * 100;
            const cagr = (Math.pow(futureValue / P, 1 / n) - 1) * 100;

            this.calculatedValues = {
                futureValue: Math.round(futureValue * 100) / 100,
                totalInterest: Math.round(totalInterest * 100) / 100,
                returnPercentage: Math.round(returnPercentage * 100) / 100,
                cagr: Math.round(cagr * 100) / 100
            };
        } else {
            this.calculatedValues = {};
        }
    }

    onSubmit(): void {
        if (this.lumpSumForm.valid) {
            this.isLoading = true;
            this.errorMessage = '';
            this.successMessage = '';

            const lumpSum: LumpSum = this.lumpSumForm.value;

            const operation = this.isEdit && this.lumpSumId
                ? this.lumpSumService.updateLumpSum(this.lumpSumId, lumpSum)
                : this.lumpSumService.createLumpSum(lumpSum);

            operation.subscribe({
                next: (savedLumpSum) => {
                    this.isLoading = false;
                    this.successMessage = this.isEdit
                        ? 'Lump sum investment updated successfully!'
                        : 'Lump sum investment created successfully!';

                    setTimeout(() => {
                        this.router.navigate(['/lump-sums']);
                    }, 1500);
                },
                error: (error) => {
                    this.isLoading = false;
                    this.errorMessage = this.isEdit
                        ? 'Failed to update lump sum investment. Please try again.'
                        : 'Failed to create lump sum investment. Please try again.';
                    console.error('Error saving lump sum:', error);
                }
            });
        } else {
            this.markFormGroupTouched();
        }
    }

    markFormGroupTouched(): void {
        Object.keys(this.lumpSumForm.controls).forEach(key => {
            const control = this.lumpSumForm.get(key);
            control?.markAsTouched();
        });
    }

    onCancel(): void {
        if (this.lumpSumForm.dirty) {
            if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
                this.router.navigate(['/lump-sums']);
            }
        } else {
            this.router.navigate(['/lump-sums']);
        }
    }

    // Getters for easy access in template
    get investmentName() { return this.lumpSumForm.get('investmentName'); }
    get principalAmount() { return this.lumpSumForm.get('principalAmount'); }
    get duration() { return this.lumpSumForm.get('duration'); }
    get expectedReturn() { return this.lumpSumForm.get('expectedReturn'); }
}