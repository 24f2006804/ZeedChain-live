export interface StartupData {
    name: string;
    description: string;
    valuation: number;
    totalShares: number;
    availableShares: number;
    sector: string;
    stage: StartupStage;
    founder: string;
    financials?: FinancialData;
    metrics?: StartupMetrics;
}

export enum StartupStage {
    SEED = 'SEED',
    EARLY = 'EARLY',
    GROWTH = 'GROWTH',
    EXPANSION = 'EXPANSION',
    LATE = 'LATE'
}

export interface FinancialData {
    revenue: number;
    expenses: number;
    cashflow: number;
    burnRate: number;
    runway: number; // months
}

export interface StartupMetrics {
    userGrowth: number; // percentage
    marketShare: number; // percentage
    customerAcquisitionCost: number;
    lifetimeValue: number;
    churnRate: number; // percentage
}

export interface MarketConditions {
    sectorGrowth: number;
    competitorAnalysis: CompetitorInfo[];
    marketSize: number;
    marketTrends: string[];
}

export interface CompetitorInfo {
    name: string;
    marketShare: number;
    strengths: string[];
    weaknesses: string[];
}

export interface InvestorPreferences {
    riskTolerance: RiskTolerance;
    investmentHorizon: InvestmentHorizon;
    preferredSectors: string[];
    minReturn: number; // percentage
    maxInvestment: number;
}

export enum RiskTolerance {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH'
}

export enum InvestmentHorizon {
    SHORT = 'SHORT', // < 1 year
    MEDIUM = 'MEDIUM', // 1-3 years
    LONG = 'LONG' // > 3 years
}