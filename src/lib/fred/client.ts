import { rateLimiter } from './rate-limiter';
import { getCached, setCache, generateCacheKey } from './cache';
import { FredApiError, FredRateLimitError, FredNotFoundError } from './errors';
import { FRED_BASE_URL } from './constants';
import type {
  FredObservationsParams,
  FredObservationsResponse,
  FredSearchParams,
  FredSearchResponse,
  FredSeriesParams,
  FredSeriesResponse,
  FredCategorySeriesParams,
  FredCategorySeriesResponse,
  FredMultiSeriesParams,
  FredMultiSeriesResponse,
} from './types';

class FredClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    const key = process.env.FRED_API_KEY;
    if (!key) {
      throw new Error('FRED_API_KEY environment variable is not set');
    }
    this.apiKey = key;
    this.baseUrl = FRED_BASE_URL;
  }

  private async fetchFromFred<T>(
    endpoint: string,
    params: Record<string, string | number | undefined>
  ): Promise<{ data: T; cached: boolean }> {
    const cleanParams: Record<string, string> = { file_type: 'json' };
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        cleanParams[key] = String(value);
      }
    }

    const cacheKey = generateCacheKey(endpoint, cleanParams);
    const cached = getCached<T>(cacheKey);
    if (cached) {
      return { data: cached, cached: true };
    }

    await rateLimiter.acquire();

    const url = new URL(`${this.baseUrl}/${endpoint}`);
    url.searchParams.set('api_key', this.apiKey);
    for (const [key, value] of Object.entries(cleanParams)) {
      url.searchParams.set(key, value);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new FredRateLimitError('FRED API rate limit exceeded');
      }
      if (response.status === 404 || response.status === 400) {
        const body = await response.text();
        throw new FredNotFoundError(
          `FRED API error (${response.status}): ${body}`
        );
      }
      throw new FredApiError(
        `FRED API request failed: ${response.status} ${response.statusText}`,
        response.status
      );
    }

    const data = (await response.json()) as T;
    setCache(cacheKey, data);

    return { data, cached: false };
  }

  async getObservations(params: FredObservationsParams) {
    return this.fetchFromFred<FredObservationsResponse>(
      'series/observations',
      params as unknown as Record<string, string | number | undefined>
    );
  }

  async searchSeries(params: FredSearchParams) {
    return this.fetchFromFred<FredSearchResponse>(
      'series/search',
      params as unknown as Record<string, string | number | undefined>
    );
  }

  async getSeriesInfo(params: FredSeriesParams) {
    return this.fetchFromFred<FredSeriesResponse>(
      'series',
      params as unknown as Record<string, string | number | undefined>
    );
  }

  async getCategorySeries(params: FredCategorySeriesParams) {
    return this.fetchFromFred<FredCategorySeriesResponse>(
      'category/series',
      params as unknown as Record<string, string | number | undefined>
    );
  }

  async getMultipleObservations(
    params: FredMultiSeriesParams
  ): Promise<FredMultiSeriesResponse> {
    const results = await Promise.allSettled(
      params.series_ids.map(async (seriesId) => {
        try {
          const { data } = await this.getObservations({
            series_id: seriesId,
            observation_start: params.observation_start,
            observation_end: params.observation_end,
            units: params.units,
            frequency: params.frequency,
          });
          return {
            series_id: seriesId,
            observations: data.observations,
          };
        } catch (error) {
          return {
            series_id: seriesId,
            observations: [] as FredObservationsResponse['observations'],
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      })
    );

    return {
      results: results.map((r) =>
        r.status === 'fulfilled'
          ? r.value
          : { series_id: 'unknown', observations: [], error: String(r.reason) }
      ),
    };
  }
}

let clientInstance: FredClient | null = null;

export function getFredClient(): FredClient {
  if (!clientInstance) {
    clientInstance = new FredClient();
  }
  return clientInstance;
}
