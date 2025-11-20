export interface IncomeSource {
    id?: number;
    sourceName: string;
    initialMonthlyIncome: number | null;
    annualGrowthRate: number | null;
    years: number | null;
    projectedMonthlyIncome: number | null;
    totalAmountReceived: number | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface IncomeSourceSummary {
    totalIncomeSources: number;
    totalInitialMonthlyIncome: number;
    totalProjectedMonthlyIncome: number;
    totalAmountReceived: number;
    averageGrowthRate: number;
    totalGrowthPercentage: number;
}

export interface IncomeProgression {
    year: number;
    monthlyIncome: number;
    annualIncome: number;
    cumulativeIncome: number;
    growthFromStart: number;
}

export interface YearlyIncome {
    year: number;
    monthlyIncome: number;
    annualIncome: number;
    growthFromPrevious: number;
}

export interface FastestGrowingIncome {
    id: number;
    sourceName: string;
    initialMonthlyIncome: number;
    projectedMonthlyIncome: number;
    annualGrowthRate: number;
    totalGrowth: number;
    years: number;
}

export interface YearlyIncomeSummary {
    year: number;
    totalMonthlyIncome: number;
    totalAnnualIncome: number;
    incomeSources: Array<{
        sourceName: string;
        monthlyIncome: number;
        annualIncome: number;
        growthRate: number;
    }>;
}