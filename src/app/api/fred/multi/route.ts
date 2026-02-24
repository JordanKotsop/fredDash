import { NextRequest, NextResponse } from 'next/server';
import { getFredClient } from '@/lib/fred/client';
import type { ApiResponse, FredMultiSeriesResponse, FredUnits, FredFrequency } from '@/lib/fred/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { series_ids, observation_start, observation_end, units, frequency } = body;

    if (!Array.isArray(series_ids) || series_ids.length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'series_ids must be a non-empty array', cached: false, timestamp: new Date().toISOString() },
        { status: 400 }
      );
    }

    if (series_ids.length > 20) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'Maximum 20 series per request', cached: false, timestamp: new Date().toISOString() },
        { status: 400 }
      );
    }

    const client = getFredClient();
    const data = await client.getMultipleObservations({
      series_ids,
      observation_start,
      observation_end,
      units: units as FredUnits | undefined,
      frequency: frequency as FredFrequency | undefined,
    });

    return NextResponse.json<ApiResponse<FredMultiSeriesResponse>>({
      data,
      error: null,
      cached: false,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: message, cached: false, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
