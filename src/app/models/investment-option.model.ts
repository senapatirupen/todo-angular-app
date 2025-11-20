export interface InvestmentOption {
  id?: number;
  name: string;
  category: 'EQUITY' | 'FIXED_INCOME' | 'REAL_ESTATE' | 'COMMODITIES' | 'ALTERNATIVE';
  minCAGR: number;
  maxCAGR: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  liquidity: 'HIGH' | 'MEDIUM' | 'LOW';
  taxEfficiency?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvestmentOptionSummary {
  totalInvestmentOptions: number;
  averageCAGR: number;
  categoryDistribution: { [key: string]: number };
  riskDistribution: { [key: string]: number };
  liquidityDistribution: { [key: string]: number };
}

export interface InvestmentRecommendation {
  id: number;
  name: string;
  category: string;
  averageCAGR: number;
  riskLevel: string;
  liquidity: string;
  matchScore: number;
}

export interface CategoryStats {
  category: string;
  count: number;
  percentage: number;
}