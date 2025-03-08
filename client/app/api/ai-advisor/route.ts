import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/services/AIService';

const aiService = new AIService(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { startupData, marketConditions, investorPreferences } = body;

        if (!startupData) {
            return NextResponse.json(
                { error: 'Missing startup data' },
                { status: 400 }
            );
        }

        const result = await aiService.generateInvestmentAdvice(
            startupData,
            marketConditions,
            investorPreferences
        );

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('AI Advisor error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate investment advice' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const startupId = searchParams.get('startupId');

    if (!startupId) {
        return NextResponse.json(
            { error: 'Missing startupId parameter' },
            { status: 400 }
        );
    }

    try {
        const startupData = await fetch(
            `${process.env.NEXT_PUBLIC_RPC_URL}/startup/${startupId}`
        ).then(res => res.json());

        const analysis = await aiService.analyzeStartup(startupData);
        return NextResponse.json(analysis);
    } catch (error: any) {
        console.error('AI Analysis error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to analyze startup' },
            { status: 500 }
        );
    }
}