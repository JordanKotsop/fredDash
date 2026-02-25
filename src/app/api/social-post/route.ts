import { NextRequest, NextResponse } from 'next/server';
import { generateSocialPost } from '@/lib/ai/social-client';
import type { SocialPostRequest, SocialPostResponse } from '@/lib/ai/social-types';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SocialPostRequest;
    const { chartTitle, chartSubtitle, seriesLabels, dateRange, explanation, tone, includeThread } = body;

    if (!chartTitle || !seriesLabels?.length || !dateRange) {
      return NextResponse.json<SocialPostResponse>(
        { post: null, error: 'Chart title, series labels, and date range are required', timestamp: new Date().toISOString() },
        { status: 400 }
      );
    }

    const post = await generateSocialPost(
      chartTitle,
      seriesLabels,
      dateRange,
      tone ?? 'professional',
      includeThread ?? false,
      explanation,
      chartSubtitle,
    );

    return NextResponse.json<SocialPostResponse>({
      post,
      error: null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to generate social post';
    return NextResponse.json<SocialPostResponse>(
      { post: null, error: msg, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
