import { Component, OnInit } from '@angular/core';
import { IncomeSource, IncomeSourceSummary, FastestGrowingIncome } from '../../models/income-source.model';
import { IncomeSourceService } from '../../services/income-source.service';

@Component({
  selector: 'app-income-source-list',
  templateUrl: './income-source-list.component.html',
  styleUrls: ['./income-source-list.component.scss']
})
export class IncomeSourceListComponent implements OnInit {
  incomeSources: IncomeSource[] = [];
  summary: IncomeSourceSummary | null = null;
  fastestGrowing: FastestGrowingIncome[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private incomeSourceService: IncomeSourceService) { }

  ngOnInit(): void {
    this.loadIncomeSources();
    this.loadSummary();
    this.loadFastestGrowing();
  }

  loadIncomeSources(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.incomeSourceService.getUserIncomeSources().subscribe({
      next: (incomeSources) => {
        this.incomeSources = incomeSources;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load income sources. Please try again.';
        this.isLoading = false;
        console.error('Error loading income sources:', error);
      }
    });
  }

  loadSummary(): void {
    this.incomeSourceService.getIncomeSourceSummary().subscribe({
      next: (summary) => {
        this.summary = summary;
      },
      error: (error) => {
        console.error('Error loading income source summary:', error);
      }
    });
  }

  loadFastestGrowing(): void {
    this.incomeSourceService.getFastestGrowingIncomes(5).subscribe({
      next: (fastestGrowing) => {
        this.fastestGrowing = fastestGrowing;
      },
      error: (error) => {
        console.error('Error loading fastest growing incomes:', error);
      }
    });
  }

  deleteIncomeSource(id: number): void {
    if (confirm('Are you sure you want to delete this income source?')) {
      this.incomeSourceService.deleteIncomeSource(id).subscribe({
        next: () => {
          this.incomeSources = this.incomeSources.filter(is => is.id !== id);
          this.loadSummary();
          this.loadFastestGrowing();
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete income source. Please try again.';
          console.error('Error deleting income source:', error);
        }
      });
    }
  }

  calculateTotalGrowth(incomeSource: IncomeSource): number {
    if (!incomeSource.initialMonthlyIncome || !incomeSource.projectedMonthlyIncome) return 0;
    return ((incomeSource.projectedMonthlyIncome - incomeSource.initialMonthlyIncome) / incomeSource.initialMonthlyIncome) * 100;
  }

  getAnnualIncome(incomeSource: IncomeSource): number {
    return incomeSource.initialMonthlyIncome ? incomeSource.initialMonthlyIncome * 12 : 0;
  }

  getProjectedAnnualIncome(incomeSource: IncomeSource): number {
    return incomeSource.projectedMonthlyIncome ? incomeSource.projectedMonthlyIncome * 12 : 0;
  }
}