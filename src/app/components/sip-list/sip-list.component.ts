import { Component, OnInit } from '@angular/core';
import { SIP, SIPSummary } from '../../models/sip.model';
import { SIPService } from '../../services/sip.service';

@Component({
  selector: 'app-sip-list',
  templateUrl: './sip-list.component.html',
  styleUrls: ['./sip-list.component.scss']
})
export class SIPListComponent implements OnInit {
  sips: SIP[] = [];
  summary: SIPSummary | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private sipService: SIPService) { }

  ngOnInit(): void {
    this.loadSIPs();
    this.loadSummary();
  }

  loadSIPs(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.sipService.getUserSIPs().subscribe({
      next: (sips) => {
        this.sips = sips;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load SIPs. Please try again.';
        this.isLoading = false;
        console.error('Error loading SIPs:', error);
      }
    });
  }

  loadSummary(): void {
    this.sipService.getSIPSummary().subscribe({
      next: (summary) => {
        this.summary = summary;
      },
      error: (error) => {
        console.error('Error loading SIP summary:', error);
      }
    });
  }

  deleteSIP(id: number): void {
    if (confirm('Are you sure you want to delete this SIP?')) {
      this.sipService.deleteSIP(id).subscribe({
        next: () => {
          this.sips = this.sips.filter(sip => sip.id !== id);
          this.loadSummary();
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete SIP. Please try again.';
          console.error('Error deleting SIP:', error);
        }
      });
    }
  }

  calculateReturnPercentage(sip: SIP): number {
    if (!sip.totalInvestment || !sip.futureValue) return 0;
    return ((sip.futureValue - sip.totalInvestment) / sip.totalInvestment) * 100;
  }

  getDurationYears(duration: number | null): number {
    return duration ? Math.round(duration / 12) : 0;
  }
}