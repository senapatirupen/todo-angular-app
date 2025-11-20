import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EMI } from 'src/app/models/emi.model';
import { EMIService } from 'src/app/services/emi.service';

@Component({
  selector: 'app-emi-form',
  templateUrl: './emi-form.component.html',
  styleUrls: ['./emi-form.component.scss']
})
export class EMIFormComponent implements OnInit {
  emiForm: FormGroup;
  isEdit = false;
  emiId?: number;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  calculatedEMI: number | null = null;

  constructor(
    private fb: FormBuilder,
    private emiService: EMIService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.emiForm = this.createForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEdit = true;
        this.emiId = +params['id'];
        this.loadEMI(this.emiId);
      }
    });

    // Recalculate EMI when form values change
    this.emiForm.valueChanges.subscribe(() => {
      this.calculateEMI();
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      emiForName: ['', [Validators.required, Validators.maxLength(100)]],
      principal: [null, [Validators.required, Validators.min(1), Validators.max(100000000)]],
      annualInterestRate: [null, [Validators.required, Validators.min(0.01), Validators.max(100)]],
      totalTenure: [null, [Validators.required, Validators.min(1), Validators.max(600)]],
      tenuresPaid: [0, [Validators.min(0), Validators.max(600)]]
    });
  }

  loadEMI(id: number): void {
    this.isLoading = true;
    this.emiService.getEMIById(id).subscribe({
      next: (emi) => {
        this.emiForm.patchValue({
          emiForName: emi.emiForName,
          principal: emi.principal,
          annualInterestRate: emi.annualInterestRate,
          totalTenure: emi.totalTenure,
          tenuresPaid: emi.tenuresPaid
        });
        this.calculatedEMI = emi.emiAmount;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load EMI. Please try again.';
        this.isLoading = false;
        console.error('Error loading EMI:', error);
      }
    });
  }

  calculateEMI(): void {
    const formValue = this.emiForm.value;
    if (formValue.principal && formValue.annualInterestRate && formValue.totalTenure) {
      const principal = formValue.principal;
      const monthlyInterestRate = formValue.annualInterestRate / 12 / 100;
      const tenure = formValue.totalTenure;

      const emi = principal * monthlyInterestRate * 
                 Math.pow(1 + monthlyInterestRate, tenure) / 
                 (Math.pow(1 + monthlyInterestRate, tenure) - 1);
      
      this.calculatedEMI = Math.round(emi * 100) / 100;
    } else {
      this.calculatedEMI = null;
    }
  }

  onSubmit(): void {
    if (this.emiForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const emi: EMI = this.emiForm.value;

      const operation = this.isEdit && this.emiId
        ? this.emiService.updateEMI(this.emiId, emi)
        : this.emiService.createEMI(emi);

      operation.subscribe({
        next: (savedEMI) => {
          this.isLoading = false;
          this.successMessage = this.isEdit 
            ? 'EMI updated successfully!' 
            : 'EMI created successfully!';
          
          setTimeout(() => {
            this.router.navigate(['/emis']);
          }, 1500);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = this.isEdit
            ? 'Failed to update EMI. Please try again.'
            : 'Failed to create EMI. Please try again.';
          console.error('Error saving EMI:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.emiForm.controls).forEach(key => {
      const control = this.emiForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel(): void {
    if (this.emiForm.dirty) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        this.router.navigate(['/emis']);
      }
    } else {
      this.router.navigate(['/emis']);
    }
  }

  // Getters for easy access in template
  get emiForName() { return this.emiForm.get('emiForName'); }
  get principal() { return this.emiForm.get('principal'); }
  get annualInterestRate() { return this.emiForm.get('annualInterestRate'); }
  get totalTenure() { return this.emiForm.get('totalTenure'); }
  get tenuresPaid() { return this.emiForm.get('tenuresPaid'); }
}