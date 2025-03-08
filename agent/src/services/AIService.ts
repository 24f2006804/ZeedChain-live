import { GoogleGenerativeAI } from '@google/generative-ai';
import { StartupData } from '../types/startup';

export class AIService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    }

    async analyzeStartup(startupData: StartupData): Promise<{
        recommendation: string;
        confidenceScore: number;
        analysis: object;
    }> {
        const prompt = this.buildAnalysisPrompt(startupData);
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        try {
            const analysis = JSON.parse(text);
            return {
                recommendation: analysis.recommendation,
                confidenceScore: analysis.confidenceScore,
                analysis: analysis.detailedAnalysis
            };
        } catch (error) {
            throw new Error('Failed to parse AI response');
        }
    }

    async generateInvestmentAdvice(
        startupData: StartupData,
        marketConditions: any,
        investorPreferences: any
    ): Promise<{
        advice: string;
        riskScore: number;
        potentialReturn: number;
    }> {
        const prompt = this.buildInvestmentAdvicePrompt(startupData, marketConditions, investorPreferences);
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        try {
            const analysis = JSON.parse(text);
            return {
                advice: analysis.investmentAdvice,
                riskScore: analysis.riskScore,
                potentialReturn: analysis.estimatedReturn
            };
        } catch (error) {
            throw new Error('Failed to parse AI response');
        }
    }

    private buildAnalysisPrompt(startupData: StartupData): string {
        return `
        Analyze the following startup data and provide a structured assessment:
        
        Company Name: ${startupData.name}
        Description: ${startupData.description}
        Valuation: ${startupData.valuation}
        Total Shares: ${startupData.totalShares}
        Sector: ${startupData.sector}
        Stage: ${startupData.stage}
        
        Please provide analysis in the following JSON format:
        {
            "recommendation": "clear recommendation statement",
            "confidenceScore": number between 0-100,
            "detailedAnalysis": {
                "strengths": [],
                "weaknesses": [],
                "opportunities": [],
                "threats": [],
                "marketFit": "analysis",
                "growthPotential": "analysis",
                "riskFactors": []
            }
        }`;
    }

    private buildInvestmentAdvicePrompt(
        startupData: StartupData,
        marketConditions: any,
        investorPreferences: any
    ): string {
        return `
        Provide investment advice based on the following data:
        
        Startup Information:
        ${JSON.stringify(startupData, null, 2)}
        
        Market Conditions:
        ${JSON.stringify(marketConditions, null, 2)}
        
        Investor Preferences:
        ${JSON.stringify(investorPreferences, null, 2)}
        
        Please provide advice in the following JSON format:
        {
            "investmentAdvice": "detailed investment recommendation",
            "riskScore": number between 0-100,
            "estimatedReturn": estimated percentage return,
            "reasonsToInvest": [],
            "risksToConsider": [],
            "timelineRecommendation": "short/medium/long term"
        }`;
    }
}

// Types
export interface AIAnalysisResponse {
    recommendation: string;
    confidenceScore: number;
    analysis: {
        strengths: string[];
        weaknesses: string[];
        opportunities: string[];
        threats: string[];
        marketFit: string;
        growthPotential: string;
        riskFactors: string[];
    };
}

export interface AIInvestmentAdvice {
    advice: string;
    riskScore: number;
    potentialReturn: number;
    reasons: string[];
    risks: string[];
    timeline: 'short' | 'medium' | 'long';
}