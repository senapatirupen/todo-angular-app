import { Component, OnInit } from '@angular/core';
import { LumpSum, LumpSumSummary, TopPerformer } from '../../models/lumpsum.model';
import { LumpSumService } from '../../services/lumpsum.service';

@Component({
    selector: 'app-lumpsum-list',
    templateUrl: './lumpsum-list.component.html',
    styleUrls: ['./lumpsum-list.component.scss']
})
export class LumpSumListComponent implements OnInit {
    lumpSums: LumpSum[] = [];
    summary: LumpSumSummary | null = null;
    topPerformers: TopPerformer[] = [];
    isLoading: boolean = false;
    errorMessage: string = '';

    constructor(private lumpSumService: LumpSumService) { }

    ngOnInit(): void {
        this.loadLumpSums();
        this.loadSummary();
        this.loadTopPerformers();
    }

    loadLumpSums(): void {
        this.isLoading = true;
        this.errorMessage = '';

        this.lumpSumService.getUserLumpSums().subscribe({
            next: (lumpSums) => {
                this.lumpSums = lumpSums;
                this.isLoading = false;
            },
            error: (error) => {
                this.errorMessage = 'Failed to load lump sum investments. Please try again.';
                this.isLoading = false;
                console.error('Error loading lump sums:', error);
            }
        });
    }

    loadSummary(): void {
        this.lumpSumService.getLumpSumSummary().subscribe({
            next: (summary) => {
                this.summary = summary;
            },
            error: (error) => {
                console.error('Error loading lump sum summary:', error);
            }
        });
    }

    loadTopPerformers(): void {
        this.lumpSumService.getTopPerformingInvestments(5).subscribe({
            next: (performers) => {
                this.topPerformers = performers;
            },
            error: (error) => {
                console.error('Error loading top performers:', error);
            }
        });
    }

    deleteLumpSum(id: number): void {
        if (confirm('Are you sure you want to delete this lump sum investment?')) {
            this.lumpSumService.deleteLumpSum(id).subscribe({
                next: () => {
                    this.lumpSums = this.lumpSums.filter(ls => ls.id !== id);
                    this.loadSummary();
                    this.loadTopPerformers();
                },
                error: (error) => {
                    this.errorMessage = 'Failed to delete lump sum investment. Please try again.';
                    console.error('Error deleting lump sum:', error);
                }
            });
        }
    }

    calculateReturnPercentage(lumpSum: LumpSum): number {
        if (!lumpSum.principalAmount || !lumpSum.totalInterest) return 0;
        return (lumpSum.totalInterest / lumpSum.principalAmount) * 100;
    }

    getCAGR(lumpSum: LumpSum): number {
        if (!lumpSum.principalAmount || !lumpSum.futureValue || !lumpSum.duration) return 0;
        const cagr = (Math.pow(lumpSum.futureValue / lumpSum.principalAmount, 1 / lumpSum.duration) - 1) * 100;
        return Math.round(cagr * 100) / 100;
    }
}