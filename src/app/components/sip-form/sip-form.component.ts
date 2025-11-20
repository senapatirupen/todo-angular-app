import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SIPService } from '../../services/sip.service';
import { SIP } from '../../models/sip.model';

@Component({
  selector: 'app-sip-form',
  templateUrl: './sip-form.component.html',
  styleUrls: ['./sip-form.component.scss']
})
export class SIPFormComponent implements OnInit {
  sipForm: FormGroup;
  isEdit = false;
  sipId?: number;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  calculatedValues: any = {};

  constructor(
    private fb: FormBuilder,
    private sipService: SIPService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.sipForm = this.createForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEdit = true;
        this.sipId = +params['id'];
        this.loadSIP(this.sipId);
      }
    });

    // Recalculate when form values change
    this.sipForm.valueChanges.subscribe(() => {
      this.calculateSIP();
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      investmentOnName: ['', [Validators.required, Validators.maxLength(100)]],
      monthlyInvestment: [null, [Validators.required, Validators.min(100), Validators.max(1000000)]],
      duration: [null, [Validators.required, Validators.min(1), Validators.max(600)]], // months
      expectedReturn: [null, [Validators.required, Validators.min(1), Validators.max(50)]]
    });
  }

  loadSIP(id: number): void {
    this.isLoading = true;
    this.sipService.getSIPById(id).subscribe({
      next: (sip) => {
        this.sipForm.patchValue({
          investmentOnName: sip.investmentOnName,
          monthlyInvestment: sip.monthlyInvestment,
          duration: sip.duration,
          expectedReturn: sip.expectedReturn
        });
        this.calculatedValues = {
          futureValue: sip.futureValue,
          totalInvestment: sip.totalInvestment,
          totalInterestPaid: sip.totalInterestPaid
        };
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load SIP. Please try again.';
        this.isLoading = false;
        console.error('Error loading SIP:', error);
      }
    });
  }

  calculateSIP(): void {
    const formValue = this.sipForm.value;
    if (formValue.monthlyInvestment && formValue.duration && formValue.expectedReturn) {
      const P = formValue.monthlyInvestment;
      const n = formValue.duration;
      const r = formValue.expectedReturn / 12 / 100;

      // SIP Future Value formula: FV = P * [((1 + r)^n - 1) / r] * (1 + r)
      const futureValue = P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
      const totalInvestment = P * n;
      const totalInterestPaid = futureValue - totalInvestment;

      this.calculatedValues = {
        futureValue: Math.round(futureValue * 100) / 100,
        totalInvestment: Math.round(totalInvestment * 100) / 100,
        totalInterestPaid: Math.round(totalInterestPaid * 100) / 100,
        returnPercentage: Math.round((totalInterestPaid / totalInvestment) * 100 * 100) / 100
      };
    } else {
      this.calculatedValues = {};
    }
  }

  onSubmit(): void {
    if (this.sipForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const sip: SIP = this.sipForm.value;

      const operation = this.isEdit && this.sipId
        ? this.sipService.updateSIP(this.sipId, sip)
        : this.sipService.createSIP(sip);

      operation.subscribe({
        next: (savedSIP) => {
          this.isLoading = false;
          this.successMessage = this.isEdit 
            ? 'SIP updated successfully!' 
            : 'SIP created successfully!';
          
          setTimeout(() => {
            this.router.navigate(['/sips']);
          }, 1500);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = this.isEdit
            ? 'Failed to update SIP. Please try again.'
            : 'Failed to create SIP. Please try again.';
          console.error('Error saving SIP:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.sipForm.controls).forEach(key => {
      const control = this.sipForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel(): void {
    if (this.sipForm.dirty) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        this.router.navigate(['/sips']);
      }
    } else {
      this.router.navigate(['/sips']);
    }
  }

  // Getters for easy access in template
  get investmentOnName() { return this.sipForm.get('investmentOnName'); }
  get monthlyInvestment() { return this.sipForm.get('monthlyInvestment'); }
  get duration() { return this.sipForm.get('duration'); }
  get expectedReturn() { return this.sipForm.get('expectedReturn'); }
}