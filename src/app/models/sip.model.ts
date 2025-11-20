export interface SIP {
  id?: number;
  investmentOnName: string;
  monthlyInvestment: number | null;
  duration: number | null;
  expectedReturn: number | null;
  futureValue: number | null;
  totalInvestment: number | null;
  totalInterestPaid: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface SIPSummary {
  totalSIPs: number;
  totalMonthlyInvestment: number;
  totalFutureValue: number;
  totalInvestment: number;
  totalExpectedInterest: number;
  averageReturn: number;
}

export interface SIPProgress {
  currentValue: number;
  investedSoFar: number;
  interestSoFar: number;
  remainingMonths: number;
}

export interface SIPProjection {
  month: number;
  monthlyInvestment: number;
  cumulativeInvestment: number;
  interestEarned: number;
  totalValue: number;
}