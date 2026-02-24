import { NextRequest, NextResponse } from 'next/server';
import { getFredClient } from '@/lib/fred/client';
import { FredApiError } from '@/lib/fred/errors';
import type { ApiResponse, FredSeriesResponse } from '@/lib/fred/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const series_id = searchParams.get('series_id');

    if (!series_id) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'series_id is required', cached: false, timestamp: new Date().toISOString() },
        { status: 400 }
      );
    }

    const client = getFredClient();
    const { data, cached } = await client.getSeriesInfo({ series_id });

    return NextResponse.json<ApiResponse<FredSeriesResponse>>({
      data,
      error: null,
      cached,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const status = error instanceof FredApiError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: message, cached: false, timestamp: new Date().toISOString() },
      { status }
    );
  }
}
