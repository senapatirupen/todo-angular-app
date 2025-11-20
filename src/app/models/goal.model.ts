export interface Goal {
  id?: number;
  name: string;
  category: 'SHORT_TERM' | 'MEDIUM_TERM' | 'LONG_TERM' | 'RETIREMENT';
  duration: number | null;
  targetAmount: number | null;
  notes?: string;
  inflationAdjustedAmount?: number | null;
  inflationRate?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface GoalSummary {
  totalGoals: number;
  totalTargetAmount: number;
  categoryDistribution: { [key: string]: number };
  categoryAmounts: { [key: string]: number };
  averageDuration: number;
  shortTermGoals: number;
  mediumTermGoals: number;
  longTermGoals: number;
  retirementGoals: number;
}

export interface GoalPlanning {
  goal: Goal;
  monthlySavingsNoReturn: number;
  monthlySavingsWithReturn: number;
  totalMonths: number;
  totalYears: number;
  inflationAdjustedAmount: number;
  yearlyBreakdown: YearlyBreakdown[];
}

export interface YearlyBreakdown {
  year: number;
  totalContributed: number;
  balance: number;
  interestEarned: number;
}

export interface UpcomingGoal {
  id: number;
  name: string;
  category: string;
  duration: number;
  targetAmount: number;
  inflationAdjustedAmount: number;
  monthlySavingsRequired: number;
  priority: string;
}

export interface GoalProgress {
  currentSavings: number;
  targetAmount: number;
  percentage: number;
  remainingAmount: number;
  isCompleted: boolean;
}