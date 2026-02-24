import { NextRequest, NextResponse } from 'next/server';
import { getFredClient } from '@/lib/fred/client';
import { FredApiError } from '@/lib/fred/errors';
import type { ApiResponse, FredObservationsResponse, FredUnits, FredFrequency, FredAggregationMethod, FredSortOrder } from '@/lib/fred/types';

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
    const { data, cached } = await client.getObservations({
      series_id,
      observation_start: searchParams.get('observation_start') ?? undefined,
      observation_end: searchParams.get('observation_end') ?? undefined,
      units: (searchParams.get('units') as FredUnits) ?? undefined,
      frequency: (searchParams.get('frequency') as FredFrequency) ?? undefined,
      aggregation_method: (searchParams.get('aggregation_method') as FredAggregationMethod) ?? undefined,
      sort_order: (searchParams.get('sort_order') as FredSortOrder) ?? undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
      offset: searchParams.get('offset') ? Number(searchParams.get('offset')) : undefined,
    });

    return NextResponse.json<ApiResponse<FredObservationsResponse>>({
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
