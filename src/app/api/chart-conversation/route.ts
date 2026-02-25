import { NextRequest, NextResponse } from 'next/server';
import { processConversationTurn } from '@/lib/ai/conversation-client';
import type { ConversationRequest, ConversationResponse } from '@/lib/ai/conversation-types';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ConversationRequest;
    const { message, chartState, history } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json<ConversationResponse>(
        { turn: null, error: 'Message is required', timestamp: new Date().toISOString() },
        { status: 400 }
      );
    }

    if (message.length > 500) {
      return NextResponse.json<ConversationResponse>(
        { turn: null, error: 'Message too long (max 500 characters)', timestamp: new Date().toISOString() },
        { status: 400 }
      );
    }

    if (!chartState || !chartState.series || chartState.series.length === 0) {
      return NextResponse.json<ConversationResponse>(
        { turn: null, error: 'Chart state with at least one series is required', timestamp: new Date().toISOString() },
        { status: 400 }
      );
    }

    const turn = await processConversationTurn(
      message.trim(),
      chartState,
      history ?? []
    );

    return NextResponse.json<ConversationResponse>({
      turn,
      error: null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to process conversation';
    return NextResponse.json<ConversationResponse>(
      { turn: null, error: msg, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
