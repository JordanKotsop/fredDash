import { NextRequest, NextResponse } from 'next/server';
import { getFredClient } from '@/lib/fred/client';
import { FredApiError } from '@/lib/fred/errors';
import type { ApiResponse, FredSearchResponse, FredSearchType, FredSearchOrderBy, FredSortOrder, FredFilterVariable } from '@/lib/fred/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search_text = searchParams.get('search_text') ?? searchParams.get('q');

    if (!search_text) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'search_text (or q) is required', cached: false, timestamp: new Date().toISOString() },
        { status: 400 }
      );
    }

    const client = getFredClient();
    const { data, cached } = await client.searchSeries({
      search_text,
      search_type: (searchParams.get('search_type') as FredSearchType) ?? undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
      offset: searchParams.get('offset') ? Number(searchParams.get('offset')) : undefined,
      order_by: (searchParams.get('order_by') as FredSearchOrderBy) ?? undefined,
      sort_order: (searchParams.get('sort_order') as FredSortOrder) ?? undefined,
      filter_variable: (searchParams.get('filter_variable') as FredFilterVariable) ?? undefined,
      filter_value: searchParams.get('filter_value') ?? undefined,
      tag_names: searchParams.get('tag_names') ?? undefined,
    });

    return NextResponse.json<ApiResponse<FredSearchResponse>>({
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
