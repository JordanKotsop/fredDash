export const FRED_BASE_URL = 'https://api.stlouisfed.org/fred';

export const FRED_DEFAULTS = {
  CACHE_TTL_MS: 10 * 60 * 1000,      // 10 minutes
  CACHE_MAX_ENTRIES: 500,
  RATE_LIMIT_PER_MINUTE: 120,
  OBSERVATIONS_LIMIT: 100_000,
  SEARCH_LIMIT: 1000,
} as const;

export const FRED_SERIES_PRESETS = {
  ECONOMY_AT_A_GLANCE: [
    { id: 'GDP', name: 'Gross Domestic Product', frequency: 'q' as const },
    { id: 'CPIAUCSL', name: 'CPI - All Urban Consumers', frequency: 'm' as const },
    { id: 'UNRATE', name: 'Unemployment Rate', frequency: 'm' as const },
    { id: 'DFF', name: 'Federal Funds Rate', frequency: 'd' as const },
    { id: 'DGS10', name: '10-Year Treasury Yield', frequency: 'd' as const },
    { id: 'UMCSENT', name: 'Consumer Sentiment', frequency: 'm' as const },
  ],
  INFLATION_WATCH: [
    { id: 'CPIAUCSL', name: 'CPI - All Urban Consumers', frequency: 'm' as const },
    { id: 'PCEPI', name: 'PCE Price Index', frequency: 'm' as const },
    { id: 'CPILFESL', name: 'Core CPI (Less Food & Energy)', frequency: 'm' as const },
    { id: 'MICH', name: 'Inflation Expectations', frequency: 'm' as const },
    { id: 'M2SL', name: 'M2 Money Supply', frequency: 'm' as const },
  ],
  JOBS_AND_EMPLOYMENT: [
    { id: 'UNRATE', name: 'Unemployment Rate', frequency: 'm' as const },
    { id: 'PAYEMS', name: 'Nonfarm Payrolls', frequency: 'm' as const },
    { id: 'ICSA', name: 'Initial Jobless Claims', frequency: 'w' as const },
    { id: 'CIVPART', name: 'Labor Force Participation', frequency: 'm' as const },
    { id: 'CES0500000003', name: 'Average Hourly Earnings', frequency: 'm' as const },
  ],
  INTEREST_RATES: [
    { id: 'DFF', name: 'Federal Funds Rate', frequency: 'd' as const },
    { id: 'DGS2', name: '2-Year Treasury Yield', frequency: 'd' as const },
    { id: 'DGS10', name: '10-Year Treasury Yield', frequency: 'd' as const },
    { id: 'DGS30', name: '30-Year Treasury Yield', frequency: 'd' as const },
    { id: 'T10Y2Y', name: 'Yield Curve Spread (10Y-2Y)', frequency: 'd' as const },
    { id: 'BAMLH0A0HYM2', name: 'High Yield Bond Spread', frequency: 'd' as const },
  ],
  HOUSING_MARKET: [
    { id: 'HOUST', name: 'Housing Starts', frequency: 'm' as const },
    { id: 'PERMIT', name: 'Building Permits', frequency: 'm' as const },
    { id: 'MORTGAGE30US', name: '30-Year Mortgage Rate', frequency: 'w' as const },
    { id: 'MSPUS', name: 'Median Home Sale Price', frequency: 'q' as const },
    { id: 'CSUSHPISA', name: 'Case-Shiller Home Price Index', frequency: 'm' as const },
  ],
  ECONOMIC_GROWTH: [
    { id: 'GDP', name: 'Gross Domestic Product', frequency: 'q' as const },
    { id: 'GDPC1', name: 'Real GDP', frequency: 'q' as const },
    { id: 'INDPRO', name: 'Industrial Production', frequency: 'm' as const },
    { id: 'RSAFS', name: 'Retail Sales', frequency: 'm' as const },
    { id: 'DCOILWTICO', name: 'WTI Crude Oil', frequency: 'd' as const },
  ],
} as const;
