// === FRED API Parameter Types ===

export type FredUnits =
  | 'lin'   // Levels (no transformation)
  | 'chg'   // Change
  | 'ch1'   // Change from Year Ago
  | 'pch'   // Percent Change
  | 'pc1'   // Percent Change from Year Ago
  | 'pca'   // Compounded Annual Rate of Change
  | 'cch'   // Continuously Compounded Rate of Change
  | 'cca'   // Continuously Compounded Annual Rate of Change
  | 'log';  // Natural Log

export type FredFrequency =
  | 'd'    // Daily
  | 'w'    // Weekly
  | 'bw'   // Biweekly
  | 'm'    // Monthly
  | 'q'    // Quarterly
  | 'sa'   // Semiannual
  | 'a';   // Annual

export type FredAggregationMethod = 'avg' | 'sum' | 'eop';

export type FredSortOrder = 'asc' | 'desc';

export type FredOutputType = 1 | 2 | 3 | 4;

export type FredSearchType = 'full_text' | 'series_id';

export type FredSearchOrderBy =
  | 'search_rank'
  | 'series_id'
  | 'title'
  | 'units'
  | 'frequency'
  | 'seasonal_adjustment'
  | 'realtime_start'
  | 'realtime_end'
  | 'last_updated'
  | 'observation_start'
  | 'observation_end'
  | 'popularity'
  | 'group_popularity';

export type FredFilterVariable = 'frequency' | 'units' | 'seasonal_adjustment';

// === Request Parameter Interfaces ===

export interface FredObservationsParams {
  series_id: string;
  observation_start?: string;
  observation_end?: string;
  units?: FredUnits;
  frequency?: FredFrequency;
  aggregation_method?: FredAggregationMethod;
  sort_order?: FredSortOrder;
  limit?: number;
  offset?: number;
  output_type?: FredOutputType;
}

export interface FredSearchParams {
  search_text: string;
  search_type?: FredSearchType;
  limit?: number;
  offset?: number;
  order_by?: FredSearchOrderBy;
  sort_order?: FredSortOrder;
  filter_variable?: FredFilterVariable;
  filter_value?: string;
  tag_names?: string;
  exclude_tag_names?: string;
}

export interface FredSeriesParams {
  series_id: string;
}

export interface FredCategorySeriesParams {
  category_id: number;
  limit?: number;
  offset?: number;
  order_by?: FredSearchOrderBy;
  sort_order?: FredSortOrder;
  filter_variable?: FredFilterVariable;
  filter_value?: string;
  tag_names?: string;
  exclude_tag_names?: string;
}

export interface FredMultiSeriesParams {
  series_ids: string[];
  observation_start?: string;
  observation_end?: string;
  units?: FredUnits;
  frequency?: FredFrequency;
}

// === Response Interfaces ===

export interface FredObservation {
  realtime_start: string;
  realtime_end: string;
  date: string;
  value: string; // FRED returns "." for missing values
}

export interface FredSeriesInfo {
  id: string;
  realtime_start: string;
  realtime_end: string;
  title: string;
  observation_start: string;
  observation_end: string;
  frequency: string;
  frequency_short: string;
  units: string;
  units_short: string;
  seasonal_adjustment: string;
  seasonal_adjustment_short: string;
  last_updated: string;
  popularity: number;
  group_popularity?: number;
  notes?: string;
}

export interface FredObservationsResponse {
  realtime_start: string;
  realtime_end: string;
  observation_start: string;
  observation_end: string;
  units: string;
  output_type: number;
  file_type: string;
  order_by: string;
  sort_order: string;
  count: number;
  offset: number;
  limit: number;
  observations: FredObservation[];
}

export interface FredSearchResponse {
  realtime_start: string;
  realtime_end: string;
  order_by: string;
  sort_order: string;
  count: number;
  offset: number;
  limit: number;
  seriess: FredSeriesInfo[]; // FRED uses double-s
}

export interface FredSeriesResponse {
  realtime_start: string;
  realtime_end: string;
  seriess: FredSeriesInfo[];
}

export interface FredCategorySeriesResponse {
  realtime_start: string;
  realtime_end: string;
  order_by: string;
  sort_order: string;
  count: number;
  offset: number;
  limit: number;
  seriess: FredSeriesInfo[];
}

// === Multi-series response (our custom shape) ===

export interface FredMultiSeriesResult {
  series_id: string;
  observations: FredObservation[];
  metadata?: FredSeriesInfo;
  error?: string;
}

export interface FredMultiSeriesResponse {
  results: FredMultiSeriesResult[];
}

// === Internal API response wrapper ===

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  cached: boolean;
  timestamp: string;
}

// === Utility ===

/** Parse FRED observation value — returns null for missing data (".") */
export function parseObservationValue(value: string): number | null {
  if (value === '.') return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
}
