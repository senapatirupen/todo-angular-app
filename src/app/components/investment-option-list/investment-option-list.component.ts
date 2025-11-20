import { Component, OnInit } from '@angular/core';
import { InvestmentOption, InvestmentOptionSummary, InvestmentRecommendation } from '../../models/investment-option.model';
import { InvestmentOptionService } from '../../services/investment-option.service';

@Component({
    selector: 'app-investment-option-list',
    templateUrl: './investment-option-list.component.html',
    styleUrls: ['./investment-option-list.component.scss']
})
export class InvestmentOptionListComponent implements OnInit {
    investmentOptions: InvestmentOption[] = [];
    summary: InvestmentOptionSummary | null = null;
    recommendations: InvestmentRecommendation[] = [];
    isLoading: boolean = false;
    errorMessage: string = '';

    // Filter properties
    selectedCategory: string = '';
    selectedRiskLevel: string = '';
    selectedLiquidity: string = '';
    minCAGR: number = 0;
    maxCAGR: number = 50;

    // Recommendation preferences
    preferredRiskLevel: string = 'MEDIUM';
    preferredLiquidity: string = 'HIGH';
    minExpectedCAGR: number = 8;

    // Categories and enums for dropdowns
    categories = ['EQUITY', 'FIXED_INCOME', 'REAL_ESTATE', 'COMMODITIES', 'ALTERNATIVE'];
    riskLevels = ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'];
    liquidityLevels = ['HIGH', 'MEDIUM', 'LOW'];

    constructor(private investmentOptionService: InvestmentOptionService) { }

    ngOnInit(): void {
        this.loadInvestmentOptions();
        this.loadSummary();
    }

    loadInvestmentOptions(): void {
        this.isLoading = true;
        this.errorMessage = '';

        this.investmentOptionService.getUserInvestmentOptions().subscribe({
            next: (options) => {
                this.investmentOptions = options;
                this.isLoading = false;
            },
            error: (error) => {
                this.errorMessage = 'Failed to load investment options. Please try again.';
                this.isLoading = false;
                console.error('Error loading investment options:', error);
            }
        });
    }

    loadSummary(): void {
        this.investmentOptionService.getInvestmentOptionsSummary().subscribe({
            next: (summary) => {
                this.summary = summary;
            },
            error: (error) => {
                console.error('Error loading investment options summary:', error);
            }
        });
    }

    loadRecommendations(): void {
        this.investmentOptionService.getRecommendedOptions(
            this.preferredRiskLevel,
            this.preferredLiquidity,
            this.minExpectedCAGR
        ).subscribe({
            next: (recommendations) => {
                this.recommendations = recommendations;
            },
            error: (error) => {
                console.error('Error loading recommendations:', error);
            }
        });
    }

    deleteInvestmentOption(id: number): void {
        if (confirm('Are you sure you want to delete this investment option?')) {
            this.investmentOptionService.deleteInvestmentOption(id).subscribe({
                next: () => {
                    this.investmentOptions = this.investmentOptions.filter(option => option.id !== id);
                    this.loadSummary();
                },
                error: (error) => {
                    this.errorMessage = 'Failed to delete investment option. Please try again.';
                    console.error('Error deleting investment option:', error);
                }
            });
        }
    }

    applyFilters(): void {
        this.isLoading = true;

        if (this.selectedCategory) {
            this.investmentOptionService.getInvestmentOptionsByCategory(this.selectedCategory).subscribe({
                next: (options) => {
                    this.investmentOptions = options;
                    this.applyAdditionalFilters();
                },
                error: (error) => {
                    this.errorMessage = 'Error applying category filter.';
                    this.isLoading = false;
                }
            });
        } else if (this.selectedRiskLevel) {
            this.investmentOptionService.getInvestmentOptionsByRiskLevel(this.selectedRiskLevel).subscribe({
                next: (options) => {
                    this.investmentOptions = options;
                    this.applyAdditionalFilters();
                },
                error: (error) => {
                    this.errorMessage = 'Error applying risk level filter.';
                    this.isLoading = false;
                }
            });
        } else if (this.selectedLiquidity) {
            this.investmentOptionService.getInvestmentOptionsByLiquidity(this.selectedLiquidity).subscribe({
                next: (options) => {
                    this.investmentOptions = options;
                    this.applyAdditionalFilters();
                },
                error: (error) => {
                    this.errorMessage = 'Error applying liquidity filter.';
                    this.isLoading = false;
                }
            });
        } else {
            this.applyAdditionalFilters();
        }
    }

    applyAdditionalFilters(): void {
        this.investmentOptions = this.investmentOptions.filter(option =>
            option.minCAGR >= this.minCAGR && option.maxCAGR <= this.maxCAGR
        );
        this.isLoading = false;
    }

    clearFilters(): void {
        this.selectedCategory = '';
        this.selectedRiskLevel = '';
        this.selectedLiquidity = '';
        this.minCAGR = 0;
        this.maxCAGR = 50;
        this.loadInvestmentOptions();
    }

    getAverageCAGR(option: InvestmentOption): number {
        return (option.minCAGR + option.maxCAGR) / 2;
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

    getCategoryStats(): any[] {
        if (!this.summary?.categoryDistribution) return [];

        return Object.entries(this.summary.categoryDistribution).map(([category, count]) => ({
            category,
            count,
            percentage: (count / this.summary!.totalInvestmentOptions) * 100
        }));
    }

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

    // getCategoryIcon(category: string): string {
    //     switch (category) {
    //         case 'EQUITY': return 'fa-chart-line';
    //         case 'FIXED_INCOME': return 'fa-hand-holding-usd';
    //         case 'REAL_ESTATE': return 'fa-home';
    //         case 'COMMODITIES': return 'fa-gem';
    //         case 'ALTERNATIVE': return 'fa-lightbulb';
    //         default: return 'fa-chart-pie';
    //     }
    // }

    // getRiskColor(riskLevel: string): string {
    //     switch (riskLevel) {
    //         case 'LOW': return 'success';
    //         case 'MEDIUM': return 'warning';
    //         case 'HIGH': return 'danger';
    //         case 'VERY_HIGH': return 'dark';
    //         default: return 'secondary';
    //     }
    // }

    // getLiquidityIcon(liquidity: string): string {
    //     switch (liquidity) {
    //         case 'HIGH': return 'fa-tachometer-alt-fast';
    //         case 'MEDIUM': return 'fa-tachometer-alt-average';
    //         case 'LOW': return 'fa-tachometer-alt-slow';
    //         default: return 'fa-tachometer-alt';
    //     }
    // }
}