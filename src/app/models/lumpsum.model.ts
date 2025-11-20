export interface LumpSum {
  id?: number;
  investmentName: string;
  principalAmount: number | null;
  duration: number | null;
  expectedReturn: number | null;
  futureValue: number | null;
  totalInterest: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LumpSumSummary {
  totalLumpSums: number;
  totalPrincipal: number;
  totalFutureValue: number;
  totalInterest: number;
  averageReturn: number;
  totalReturnPercentage: number;
}

export interface LumpSumProgress {
  currentValue: number;
  interestSoFar: number;
  remainingYears: number;
  projectedFutureValue: number;
}

export interface LumpSumProjection {
  year: number;
  principal: number;
  interest: number;
  totalValue: number;
  returnPercentage: number;
}

export interface TopPerformer {
  id: number;
  investmentName: string;
  principalAmount: number;
  futureValue: number;
  totalReturn: number;
  returnPercentage: number;
  duration: number;
}