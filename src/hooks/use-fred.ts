'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  ApiResponse,
  FredObservationsResponse,
  FredSearchResponse,
  FredSeriesResponse,
  FredMultiSeriesResponse,
  FredUnits,
  FredFrequency,
} from '@/lib/fred/types';

function useFredFetch<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [cached, setCached] = useState<boolean>(false);

  useEffect(() => {
    if (!url) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(url)
      .then((res) => res.json() as Promise<ApiResponse<T>>)
      .then((result) => {
        if (cancelled) return;
        if (result.error) {
          setError(result.error);
          setData(null);
        } else {
          setData(result.data);
          setCached(result.cached);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Fetch failed');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return { data, error, loading, cached };
}

export function useFredObservations(
  params: {
    seriesId: string;
    observationStart?: string;
    observationEnd?: string;
    units?: FredUnits;
    frequency?: FredFrequency;
  } | null
) {
  const url = params
    ? `/api/fred/observations?${new URLSearchParams(
        Object.entries({
          series_id: params.seriesId,
          observation_start: params.observationStart,
          observation_end: params.observationEnd,
          units: params.units,
          frequency: params.frequency,
        }).filter((entry): entry is [string, string] => entry[1] !== undefined)
      ).toString()}`
    : null;

  return useFredFetch<FredObservationsResponse>(url);
}

export function useFredSearch(searchText: string | null, limit?: number) {
  const url = searchText
    ? `/api/fred/search?${new URLSearchParams({
        search_text: searchText,
        ...(limit ? { limit: String(limit) } : {}),
      }).toString()}`
    : null;

  return useFredFetch<FredSearchResponse>(url);
}

export function useFredSeries(seriesId: string | null) {
  const url = seriesId
    ? `/api/fred/series?series_id=${encodeURIComponent(seriesId)}`
    : null;

  return useFredFetch<FredSeriesResponse>(url);
}

export function useFredMultiSeries(
  params: {
    seriesIds: string[];
    observationStart?: string;
    observationEnd?: string;
    units?: FredUnits;
    frequency?: FredFrequency;
  } | null
) {
  const [data, setData] = useState<FredMultiSeriesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const seriesKey = params?.seriesIds.join(',') ?? '';

  const fetchData = useCallback(async () => {
    if (!params || params.seriesIds.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/fred/multi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          series_ids: params.seriesIds,
          observation_start: params.observationStart,
          observation_end: params.observationEnd,
          units: params.units,
          frequency: params.frequency,
        }),
      });

      const result = (await response.json()) as ApiResponse<FredMultiSeriesResponse>;
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fetch failed');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seriesKey, params?.observationStart, params?.observationEnd, params?.units, params?.frequency]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, loading, refetch: fetchData };
}
