import { NextRequest, NextResponse } from 'next/server';
import { interpretQuery } from '@/lib/ai/openai-client';
import type { QueryResponse } from '@/lib/ai/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json<QueryResponse>(
        { interpretation: null, error: 'Query is required', timestamp: new Date().toISOString() },
        { status: 400 }
      );
    }

    if (query.length > 500) {
      return NextResponse.json<QueryResponse>(
        { interpretation: null, error: 'Query too long (max 500 characters)', timestamp: new Date().toISOString() },
        { status: 400 }
      );
    }

    const interpretation = await interpretQuery(query.trim());

    return NextResponse.json<QueryResponse>({
      interpretation,
      error: null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to interpret query';
    return NextResponse.json<QueryResponse>(
      { interpretation: null, error: message, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
