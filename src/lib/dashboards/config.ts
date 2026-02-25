export type IndicatorFormat = 'percent' | 'dollars' | 'index' | 'thousands' | 'number' | 'rate';

export interface DashboardIndicator {
  seriesId: string;
  displayName: string;
  userQuestion: string;
  format: IndicatorFormat;
}

export interface DashboardConfig {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  indicators: DashboardIndicator[];
}

export const DASHBOARDS: DashboardConfig[] = [
  {
    id: 'economy-at-a-glance',
    title: 'Economy at a Glance',
    description: 'The big picture — top-line numbers that tell you how the economy is doing right now.',
    icon: 'globe',
    color: '#2563eb',
    indicators: [
      { seriesId: 'GDPC1', displayName: 'Real GDP', userQuestion: 'Is the economy growing?', format: 'dollars' },
      { seriesId: 'UNRATE', displayName: 'Unemployment Rate', userQuestion: 'Are people finding jobs?', format: 'percent' },
      { seriesId: 'CPIAUCSL', displayName: 'Consumer Prices (CPI)', userQuestion: 'Are prices going up?', format: 'index' },
      { seriesId: 'DFF', displayName: 'Fed Funds Rate', userQuestion: "What's the Fed doing?", format: 'percent' },
      { seriesId: 'SP500', displayName: 'S&P 500', userQuestion: "How's the stock market?", format: 'index' },
      { seriesId: 'UMCSENT', displayName: 'Consumer Sentiment', userQuestion: 'How do people feel about the economy?', format: 'index' },
    ],
  },
  {
    id: 'inflation-watch',
    title: 'Inflation Watch',
    description: 'Price changes across the economy — are things getting more expensive?',
    icon: 'fire',
    color: '#dc2626',
    indicators: [
      { seriesId: 'CPIAUCSL', displayName: 'CPI (All Items)', userQuestion: 'How fast are prices rising?', format: 'index' },
      { seriesId: 'CPILFESL', displayName: 'Core CPI', userQuestion: 'What about prices without food & energy?', format: 'index' },
      { seriesId: 'PCEPI', displayName: 'PCE Price Index', userQuestion: "What's the Fed's preferred inflation measure?", format: 'index' },
      { seriesId: 'PCEPILFE', displayName: 'Core PCE', userQuestion: 'Core inflation by the Fed measure?', format: 'index' },
      { seriesId: 'PPIACO', displayName: 'Producer Prices', userQuestion: 'Are business costs rising?', format: 'index' },
    ],
  },
  {
    id: 'jobs-employment',
    title: 'Jobs & Employment',
    description: 'The labor market — who is working, who is looking, and how much they earn.',
    icon: 'briefcase',
    color: '#16a34a',
    indicators: [
      { seriesId: 'UNRATE', displayName: 'Unemployment Rate', userQuestion: 'What percent of people are unemployed?', format: 'percent' },
      { seriesId: 'PAYEMS', displayName: 'Nonfarm Payrolls', userQuestion: 'How many jobs were added?', format: 'thousands' },
      { seriesId: 'ICSA', displayName: 'Initial Jobless Claims', userQuestion: 'How many people filed for unemployment?', format: 'thousands' },
      { seriesId: 'CIVPART', displayName: 'Labor Force Participation', userQuestion: 'What share of people are in the workforce?', format: 'percent' },
      { seriesId: 'CES0500000003', displayName: 'Avg. Hourly Earnings', userQuestion: 'Are wages going up?', format: 'dollars' },
    ],
  },
  {
    id: 'interest-rates',
    title: 'Interest Rates & Bonds',
    description: 'Borrowing costs and bond yields — where rates are and where they might be headed.',
    icon: 'bank',
    color: '#f59e0b',
    indicators: [
      { seriesId: 'DFF', displayName: 'Federal Funds Rate', userQuestion: "What's the Fed's target rate?", format: 'percent' },
      { seriesId: 'DGS10', displayName: '10-Year Treasury', userQuestion: 'What are long-term rates?', format: 'percent' },
      { seriesId: 'DGS2', displayName: '2-Year Treasury', userQuestion: 'What are short-term rates?', format: 'percent' },
      { seriesId: 'T10Y2Y', displayName: 'Yield Curve Spread', userQuestion: 'Is the yield curve inverted?', format: 'percent' },
      { seriesId: 'DFII10', displayName: '10-Year Real Yield (TIPS)', userQuestion: 'What are real interest rates?', format: 'percent' },
    ],
  },
  {
    id: 'housing-market',
    title: 'Housing Market',
    description: 'Home prices, mortgage rates, and construction — the pulse of real estate.',
    icon: 'home',
    color: '#8b5cf6',
    indicators: [
      { seriesId: 'HOUST', displayName: 'Housing Starts', userQuestion: 'How many new homes are being built?', format: 'thousands' },
      { seriesId: 'PERMIT', displayName: 'Building Permits', userQuestion: 'How many permits were issued?', format: 'thousands' },
      { seriesId: 'MSPUS', displayName: 'Median Home Price', userQuestion: 'What does a typical home cost?', format: 'dollars' },
      { seriesId: 'MORTGAGE30US', displayName: '30-Year Mortgage Rate', userQuestion: "What's the mortgage rate?", format: 'percent' },
      { seriesId: 'EXHOSLUSM495S', displayName: 'Existing Home Sales', userQuestion: 'How many homes are selling?', format: 'thousands' },
    ],
  },
  {
    id: 'economic-growth',
    title: 'Economic Growth',
    description: 'Output, production, and spending — are businesses and consumers active?',
    icon: 'chart',
    color: '#06b6d4',
    indicators: [
      { seriesId: 'GDPC1', displayName: 'Real GDP', userQuestion: 'How fast is the economy growing?', format: 'dollars' },
      { seriesId: 'INDPRO', displayName: 'Industrial Production', userQuestion: 'Are factories busy?', format: 'index' },
      { seriesId: 'RSAFS', displayName: 'Retail Sales', userQuestion: 'Are consumers spending?', format: 'dollars' },
      { seriesId: 'UMCSENT', displayName: 'Consumer Sentiment', userQuestion: 'Are people optimistic?', format: 'index' },
      { seriesId: 'BUSINV', displayName: 'Business Inventories', userQuestion: 'Are shelves stocked or empty?', format: 'dollars' },
    ],
  },
];

export function getDashboardBySlug(slug: string): DashboardConfig | undefined {
  return DASHBOARDS.find((d) => d.id === slug);
}
