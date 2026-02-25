import { NextRequest, NextResponse } from 'next/server';
import { generateExplanation, type ExplanationResult, type ExplanationDepth } from '@/lib/ai/explain-client';

interface ExplainResponse {
  explanation: ExplanationResult | null;
  error: string | null;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { seriesName, seriesId, dateRange, depth } = body;

    if (!seriesName || !seriesId) {
      return NextResponse.json<ExplainResponse>(
        { explanation: null, error: 'seriesName and seriesId are required', timestamp: new Date().toISOString() },
        { status: 400 }
      );
    }

    const explanation = await generateExplanation(
      seriesName,
      seriesId,
      dateRange ?? '5Y',
      (depth as ExplanationDepth) ?? 'normal'
    );

    return NextResponse.json<ExplainResponse>({
      explanation,
      error: null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate explanation';
    return NextResponse.json<ExplainResponse>(
      { explanation: null, error: message, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
