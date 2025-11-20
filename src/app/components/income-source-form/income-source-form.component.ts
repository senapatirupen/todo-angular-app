import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IncomeSourceService } from '../../services/income-source.service';
import { IncomeSource } from '../../models/income-source.model';

@Component({
  selector: 'app-income-source-form',
  templateUrl: './income-source-form.component.html',
  styleUrls: ['./income-source-form.component.scss']
})
export class IncomeSourceFormComponent implements OnInit {
  incomeSourceForm: FormGroup;
  isEdit = false;
  incomeSourceId?: number;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  calculatedValues: any = {};

  constructor(
    private fb: FormBuilder,
    private incomeSourceService: IncomeSourceService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.incomeSourceForm = this.createForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEdit = true;
        this.incomeSourceId = +params['id'];
        this.loadIncomeSource(this.incomeSourceId);
      }
    });

    // Recalculate when form values change
    this.incomeSourceForm.valueChanges.subscribe(() => {
      this.calculateIncomeProjection();
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      sourceName: ['', [Validators.required, Validators.maxLength(100)]],
      initialMonthlyIncome: [null, [Validators.required, Validators.min(1), Validators.max(1000000)]],
      annualGrowthRate: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      years: [null, [Validators.required, Validators.min(1), Validators.max(50)]]
    });
  }

  loadIncomeSource(id: number): void {
    this.isLoading = true;
    this.incomeSourceService.getIncomeSourceById(id).subscribe({
      next: (incomeSource) => {
        this.incomeSourceForm.patchValue({
          sourceName: incomeSource.sourceName,
          initialMonthlyIncome: incomeSource.initialMonthlyIncome,
          annualGrowthRate: incomeSource.annualGrowthRate,
          years: incomeSource.years
        });
        this.calculatedValues = {
          projectedMonthlyIncome: incomeSource.projectedMonthlyIncome,
          totalAmountReceived: incomeSource.totalAmountReceived
        };
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load income source. Please try again.';
        this.isLoading = false;
        console.error('Error loading income source:', error);
      }
    });
  }

  calculateIncomeProjection(): void {
    const formValue = this.incomeSourceForm.value;
    if (formValue.initialMonthlyIncome && formValue.annualGrowthRate && formValue.years) {
      const initialIncome = formValue.initialMonthlyIncome;
      const growthRate = formValue.annualGrowthRate / 100;
      const years = formValue.years;

      // Calculate projected monthly income
      const projectedMonthlyIncome = initialIncome * Math.pow(1 + growthRate, years);
      
      // Calculate total amount received over the years
      let totalAmount = 0;
      let currentYearIncome = initialIncome * 12; // Annual income for first year
      
      for (let year = 1; year <= years; year++) {
        totalAmount += currentYearIncome;
        currentYearIncome *= (1 + growthRate); // Grow income for next year
      }

      const totalGrowth = ((projectedMonthlyIncome - initialIncome) / initialIncome) * 100;

      this.calculatedValues = {
        projectedMonthlyIncome: Math.round(projectedMonthlyIncome * 100) / 100,
        totalAmountReceived: Math.round(totalAmount * 100) / 100,
        totalGrowth: Math.round(totalGrowth * 100) / 100,
        projectedAnnualIncome: Math.round(projectedMonthlyIncome * 12 * 100) / 100
      };
    } else {
      this.calculatedValues = {};
    }
  }

  onSubmit(): void {
    if (this.incomeSourceForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const incomeSource: IncomeSource = this.incomeSourceForm.value;

      const operation = this.isEdit && this.incomeSourceId
        ? this.incomeSourceService.updateIncomeSource(this.incomeSourceId, incomeSource)
        : this.incomeSourceService.createIncomeSource(incomeSource);

      operation.subscribe({
        next: (savedIncomeSource) => {
          this.isLoading = false;
          this.successMessage = this.isEdit 
            ? 'Income source updated successfully!' 
            : 'Income source created successfully!';
          
          setTimeout(() => {
            this.router.navigate(['/income-sources']);
          }, 1500);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = this.isEdit
            ? 'Failed to update income source. Please try again.'
            : 'Failed to create income source. Please try again.';
          console.error('Error saving income source:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.incomeSourceForm.controls).forEach(key => {
      const control = this.incomeSourceForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel(): void {
    if (this.incomeSourceForm.dirty) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        this.router.navigate(['/income-sources']);
      }
    } else {
      this.router.navigate(['/income-sources']);
    }
  }

  // Getters for easy access in template
  get sourceName() { return this.incomeSourceForm.get('sourceName'); }
  get initialMonthlyIncome() { return this.incomeSourceForm.get('initialMonthlyIncome'); }
  get annualGrowthRate() { return this.incomeSourceForm.get('annualGrowthRate'); }
  get years() { return this.incomeSourceForm.get('years'); }
}