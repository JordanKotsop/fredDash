import OpenAI from 'openai';
import type { QueryInterpretation } from './types';

let openaiInstance: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openaiInstance = new OpenAI({ apiKey });
  }
  return openaiInstance;
}

const SYSTEM_PROMPT = `You are FredDash's query interpreter. Your ONLY job is to translate natural language questions about the economy into FRED series IDs and chart configuration.

CRITICAL RULES:
1. You NEVER receive or analyze actual FRED data — you only select which series to fetch
2. Your explanations come from GENERAL economic knowledge, NOT from any data
3. Always return structured output via the provided function

COMMON SERIES MAPPINGS:
- Inflation/CPI → CPIAUCSL (monthly), CPILFESL (core CPI)
- PCE inflation → PCEPI (monthly), PCEPILFE (core PCE)
- Unemployment → UNRATE (monthly)
- Jobs/payrolls → PAYEMS (monthly), ICSA (weekly claims)
- GDP → GDP (nominal quarterly), GDPC1 (real quarterly)
- Fed funds rate → DFF (daily)
- 10-year yield → DGS10 (daily)
- 2-year yield → DGS2 (daily)
- 30-year yield → DGS30 (daily)
- Yield curve → T10Y2Y (10Y-2Y spread, daily)
- Consumer sentiment → UMCSENT (monthly)
- Housing starts → HOUST (monthly)
- Building permits → PERMIT (monthly)
- Mortgage rates → MORTGAGE30US (weekly)
- Home prices → CSUSHPISA (Case-Shiller, monthly), MSPUS (median sale, quarterly)
- M2 money supply → M2SL (monthly)
- Oil prices → DCOILWTICO (WTI, daily)
- High yield spread → BAMLH0A0HYM2 (daily)
- Retail sales → RSAFS (monthly)
- Industrial production → INDPRO (monthly)
- Wage growth → CES0500000003 (avg hourly earnings, monthly)
- Labor force participation → CIVPART (monthly)
- Inflation expectations → MICH (monthly), T5YIE (5Y breakeven, daily)
- S&P 500 → SP500 (daily)
- VIX → VIXCLS (daily)

CHART TYPE GUIDANCE:
- "line" for most time series (rates, indices, prices)
- "area" for cumulative/volume data (money supply, GDP level)
- "bar" for periodic data at wide intervals (quarterly GDP)
- "composed" when mixing types (e.g., bar for GDP + line for growth rate)

DATE RANGE GUIDANCE:
- Recent events → "1Y" or "2Y"
- Trend analysis → "5Y"
- Historical context → "10Y"
- Full history → "MAX"
- Short-term moves → "1M" or "3M"

When multiple series have different units, assign the secondary series to yAxisId "right".
Always provide helpful follow-up queries that a curious investor might ask next.
For explanation, write 2-3 sentences in plain English that a non-expert would understand. Do NOT reference specific data values since you don't have the data.`;

const INTERPRET_QUERY_TOOL: OpenAI.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'interpret_query',
    description: 'Interpret a natural language economic query into FRED series and chart configuration',
    parameters: {
      type: 'object',
      required: ['series', 'chart_type', 'date_range', 'title', 'subtitle', 'explanation', 'follow_up_queries'],
      properties: {
        series: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id', 'label', 'type'],
            properties: {
              id: { type: 'string', description: 'FRED series ID' },
              label: { type: 'string', description: 'Human-readable label for the series' },
              type: { type: 'string', enum: ['line', 'area', 'bar'] },
              yAxisId: { type: 'string', enum: ['left', 'right'], description: 'Which Y-axis to use (default: left)' },
              units: { type: 'string', description: 'Unit description (e.g., "Percent", "Billions of Dollars")' },
            },
          },
        },
        chart_type: { type: 'string', enum: ['line', 'area', 'bar', 'composed'] },
        date_range: { type: 'string', enum: ['1M', '3M', '6M', '1Y', '2Y', '5Y', '10Y', 'MAX'] },
        title: { type: 'string', description: 'Chart title' },
        subtitle: { type: 'string', description: 'Chart subtitle with context' },
        explanation: { type: 'string', description: 'Plain-English explanation (2-3 sentences, general knowledge only)' },
        follow_up_queries: {
          type: 'array',
          items: { type: 'string' },
          description: '3-5 suggested follow-up questions',
        },
      },
    },
  },
};

export async function interpretQuery(query: string): Promise<QueryInterpretation> {
  const openai = getOpenAI();

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: query },
    ],
    tools: [INTERPRET_QUERY_TOOL],
    tool_choice: { type: 'function', function: { name: 'interpret_query' } },
    temperature: 0.3,
  });

  const toolCall = response.choices[0]?.message?.tool_calls?.[0];
  if (!toolCall || toolCall.type !== 'function' || toolCall.function.name !== 'interpret_query') {
    throw new Error('AI did not return a valid interpretation');
  }

  const result = JSON.parse(toolCall.function.arguments) as QueryInterpretation;

  // Validate minimum fields
  if (!result.series || result.series.length === 0) {
    throw new Error('AI could not identify any relevant economic data series');
  }

  return result;
}
