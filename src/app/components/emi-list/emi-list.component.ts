import { Component, OnInit } from '@angular/core';
import { EMI, EMISummary } from 'src/app/models/emi.model';
import { EMIService } from 'src/app/services/emi.service';

@Component({
  selector: 'app-emi-list',
  templateUrl: './emi-list.component.html',
  styleUrls: ['./emi-list.component.scss']
})
export class EMIListComponent implements OnInit {
  emis: EMI[] = [];
  summary: EMISummary | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private emiService: EMIService) { }

  ngOnInit(): void {
    this.loadEMIs();
    this.loadSummary();
  }

  loadEMIs(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.emiService.getUserEMIs().subscribe({
      next: (emis) => {
        this.emis = emis;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load EMIs. Please try again.';
        this.isLoading = false;
        console.error('Error loading EMIs:', error);
      }
    });
  }

  loadSummary(): void {
    this.emiService.getEMISummary().subscribe({
      next: (summary) => {
        this.summary = summary;
      },
      error: (error) => {
        console.error('Error loading EMI summary:', error);
      }
    });
  }

  deleteEMI(id: number): void {
    if (confirm('Are you sure you want to delete this EMI?')) {
      this.emiService.deleteEMI(id).subscribe({
        next: () => {
          this.emis = this.emis.filter(emi => emi.id !== id);
          this.loadSummary();
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete EMI. Please try again.';
          console.error('Error deleting EMI:', error);
        }
      });
    }
  }

  makePayment(id: number): void {
    if (confirm('Mark this month\'s payment as paid?')) {
      this.emiService.makePayment(id).subscribe({
        next: (updatedEMI) => {
          const index = this.emis.findIndex(emi => emi.id === id);
          if (index !== -1) {
            this.emis[index] = updatedEMI;
          }
          this.loadSummary();
        },
        error: (error) => {
          this.errorMessage = 'Failed to process payment. Please try again.';
          console.error('Error processing payment:', error);
        }
      });
    }
  }

  calculateProgress(emi: EMI): number {
    if (!emi.principal || !emi.principalPaidSoFar) return 0;
    return (emi.principalPaidSoFar / emi.principal) * 100;
  }
}