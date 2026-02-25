import OpenAI from 'openai';
import type { ChartState, ConversationTurn } from './conversation-types';

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

function buildSystemPrompt(chartState: ChartState): string {
  return `You are FredDash's interactive chart assistant. The user is looking at a chart and having a conversation about it. Your job is to help them explore, modify, and understand economic data.

CURRENT CHART STATE:
- Title: "${chartState.title}"
- Subtitle: "${chartState.subtitle}"
- Series: ${chartState.series.map((s) => `${s.label} (${s.id})`).join(', ')}
- Date Range: ${chartState.dateRange}
- Chart Type: ${chartState.chartType}
- Units: ${chartState.units}

CRITICAL RULES:
1. You NEVER receive or analyze actual FRED data values — you only know which series are on the chart
2. Your explanations come from GENERAL economic knowledge, NOT from any data
3. When the user asks to modify the chart, use the modify_chart function
4. When the user asks a question about what they see, use the explain_chart function
5. You can use BOTH functions in one turn (e.g., add a series AND explain why)
6. Always respond in plain English that a non-expert investor (age 40-60) would understand

SERIES MAPPINGS:
- Inflation/CPI → CPIAUCSL, CPILFESL (core), PCEPI, PCEPILFE (core PCE), PPIACO
- Unemployment → UNRATE
- Jobs/payrolls → PAYEMS, ICSA (claims), CIVPART, CES0500000003 (wages)
- GDP → GDP (nominal), GDPC1 (real)
- Fed funds rate → DFF
- Treasuries → DGS2 (2Y), DGS10 (10Y), DGS30 (30Y)
- Yield curve → T10Y2Y (10Y-2Y spread)
- Consumer sentiment → UMCSENT
- Housing → HOUST (starts), PERMIT, MORTGAGE30US, MSPUS, EXHOSLUSM495S, CSUSHPISA
- Money supply → M2SL
- Oil → DCOILWTICO
- S&P 500 → SP500
- VIX → VIXCLS
- Retail sales → RSAFS
- Industrial production → INDPRO

UNIT OPTIONS:
- "lin" = levels (normal values)
- "chg" = change from previous period
- "pch" = percent change from previous period
- "pc1" = percent change from year ago (year-over-year)
- "log" = natural log

Always provide 2-3 follow-up suggestions the user might want to try next.`;
}

const CONVERSATION_TOOLS: OpenAI.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'modify_chart',
      description: 'Modify the current chart configuration. Only include fields that should change.',
      parameters: {
        type: 'object',
        properties: {
          add_series: {
            type: 'array',
            description: 'New series to add to the chart',
            items: {
              type: 'object',
              required: ['id', 'label'],
              properties: {
                id: { type: 'string', description: 'FRED series ID' },
                label: { type: 'string', description: 'Display label' },
                type: { type: 'string', enum: ['line', 'area', 'bar'] },
                yAxisId: { type: 'string', enum: ['left', 'right'] },
                units: { type: 'string', description: 'Unit description' },
              },
            },
          },
          remove_series: {
            type: 'array',
            description: 'Series IDs to remove from the chart',
            items: { type: 'string' },
          },
          date_range: {
            type: 'string',
            enum: ['1M', '3M', '6M', '1Y', '2Y', '5Y', '10Y', 'MAX'],
            description: 'New date range preset',
          },
          chart_type: {
            type: 'string',
            enum: ['line', 'area', 'bar', 'composed'],
            description: 'New chart type',
          },
          units: {
            type: 'string',
            enum: ['lin', 'chg', 'ch1', 'pch', 'pc1', 'pca', 'cch', 'log'],
            description: 'New data transformation units',
          },
          title: { type: 'string', description: 'New chart title' },
          subtitle: { type: 'string', description: 'New chart subtitle' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'explain_chart',
      description: 'Provide an explanation or answer a question about the chart using general economic knowledge. Do NOT reference specific data values.',
      parameters: {
        type: 'object',
        required: ['explanation'],
        properties: {
          explanation: {
            type: 'string',
            description: 'Plain-English explanation (general knowledge only, no specific data values)',
          },
          highlight_date: {
            type: 'string',
            description: 'Optional date to highlight on the chart (YYYY-MM-DD)',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'respond',
      description: 'Send a text response to the user with optional follow-up suggestions',
      parameters: {
        type: 'object',
        required: ['message', 'follow_up_suggestions'],
        properties: {
          message: {
            type: 'string',
            description: 'The response message to show the user',
          },
          follow_up_suggestions: {
            type: 'array',
            items: { type: 'string' },
            description: '2-3 suggested follow-up actions',
          },
        },
      },
    },
  },
];

export async function processConversationTurn(
  message: string,
  chartState: ChartState,
  history: { role: 'user' | 'assistant'; content: string }[]
): Promise<ConversationTurn> {
  const openai = getOpenAI();

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: 'system', content: buildSystemPrompt(chartState) },
    ...history.slice(-10).map((h) => ({
      role: h.role as 'user' | 'assistant',
      content: h.content,
    })),
    { role: 'user', content: message },
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
    tools: CONVERSATION_TOOLS,
    temperature: 0.3,
  });

  const toolCalls = response.choices[0]?.message?.tool_calls ?? [];
  const textContent = response.choices[0]?.message?.content;

  const turn: ConversationTurn = {
    message: '',
    follow_up_suggestions: [],
  };

  for (const toolCall of toolCalls) {
    if (toolCall.type !== 'function') continue;
    const args = JSON.parse(toolCall.function.arguments);

    switch (toolCall.function.name) {
      case 'modify_chart':
        turn.modification = args;
        break;
      case 'explain_chart':
        turn.explanation = args;
        break;
      case 'respond':
        turn.message = args.message ?? '';
        turn.follow_up_suggestions = args.follow_up_suggestions ?? [];
        break;
    }
  }

  // Build the user-facing message
  if (turn.explanation) {
    turn.message = turn.explanation.explanation;
  }
  if (!turn.message && textContent) {
    turn.message = textContent;
  }
  if (!turn.message) {
    // Fallback: describe what changed
    if (turn.modification) {
      const parts: string[] = [];
      if (turn.modification.add_series?.length) {
        parts.push(`Added ${turn.modification.add_series.map((s) => s.label).join(', ')} to the chart.`);
      }
      if (turn.modification.remove_series?.length) {
        parts.push(`Removed ${turn.modification.remove_series.join(', ')} from the chart.`);
      }
      if (turn.modification.date_range) parts.push(`Changed date range to ${turn.modification.date_range}.`);
      if (turn.modification.chart_type) parts.push(`Switched to ${turn.modification.chart_type} chart.`);
      if (turn.modification.units) parts.push(`Changed units to ${turn.modification.units}.`);
      turn.message = parts.join(' ') || 'Chart updated.';
    } else {
      turn.message = "I'm not sure how to help with that. Try asking about the data on the chart, or ask me to add a new indicator.";
    }
  }

  return turn;
}
