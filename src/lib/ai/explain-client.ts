import OpenAI from 'openai';

let openaiInstance: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY environment variable is not set');
    openaiInstance = new OpenAI({ apiKey });
  }
  return openaiInstance;
}

export interface ExplanationResult {
  summary: string;
  trend_context: string;
  what_it_means: string;
  retirement_impact: string;
  follow_up: string;
}

export type ExplanationDepth = 'simple' | 'normal' | 'detailed';

const SYSTEM_PROMPT = `You are FredDash's economic explainer. You write clear, plain-English explanations of economic indicators for everyday people, especially those aged 40-60 planning for retirement.

CRITICAL RULES:
1. You NEVER receive actual FRED data values. You only know the indicator name and date range.
2. Your explanations come from GENERAL economic knowledge only.
3. Write at an 8th grade reading level. No jargon.
4. Always include practical retirement implications.
5. Be honest when things are uncertain — don't pretend to know current values.

TONE: Friendly, reassuring, educational. Like a knowledgeable friend explaining things over coffee. Not alarmist, not dismissive.`;

const EXPLAIN_TOOL: OpenAI.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'generate_explanation',
    description: 'Generate a plain-English explanation of an economic indicator',
    parameters: {
      type: 'object',
      required: ['summary', 'trend_context', 'what_it_means', 'retirement_impact', 'follow_up'],
      properties: {
        summary: {
          type: 'string',
          description: '1-2 sentences: what this indicator is and why it matters. Use simple language.',
        },
        trend_context: {
          type: 'string',
          description: '1-2 sentences: general context about recent trends for this indicator. Do NOT cite specific numbers you don\'t have.',
        },
        what_it_means: {
          type: 'string',
          description: '2-3 sentences: what this means in practical terms for everyday people. Use analogies if helpful.',
        },
        retirement_impact: {
          type: 'string',
          description: '2-3 sentences: what this specifically means for someone planning for or in retirement. Be practical and actionable.',
        },
        follow_up: {
          type: 'string',
          description: '1 sentence: what related indicator they might want to look at next and why.',
        },
      },
    },
  },
};

function buildUserPrompt(
  seriesName: string,
  seriesId: string,
  dateRange: string,
  depth: ExplanationDepth
): string {
  const depthInstructions: Record<ExplanationDepth, string> = {
    simple: 'Explain this as simply as possible. Use short sentences. Avoid any technical terms. Imagine explaining to someone who has never followed the economy.',
    normal: 'Explain clearly for someone with basic knowledge. Keep it accessible but informative.',
    detailed: 'Provide a thorough explanation with more economic context. You can use some technical terms but always define them. Include historical context about how this indicator has behaved.',
  };

  return `Explain this economic indicator for the dashboard:

Indicator: ${seriesName} (FRED series: ${seriesId})
Date range shown: ${dateRange}

${depthInstructions[depth]}

Remember: You do NOT have the actual data values. Explain what this indicator generally measures, what trends typically mean, and why someone should care.`;
}

export async function generateExplanation(
  seriesName: string,
  seriesId: string,
  dateRange: string,
  depth: ExplanationDepth = 'normal'
): Promise<ExplanationResult> {
  const openai = getOpenAI();
  const model = depth === 'simple' ? 'gpt-4o-mini' : 'gpt-4o';

  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(seriesName, seriesId, dateRange, depth) },
    ],
    tools: [EXPLAIN_TOOL],
    tool_choice: { type: 'function', function: { name: 'generate_explanation' } },
    temperature: 0.4,
  });

  const toolCall = response.choices[0]?.message?.tool_calls?.[0];
  if (!toolCall || toolCall.type !== 'function') {
    throw new Error('AI did not return a valid explanation');
  }

  return JSON.parse(toolCall.function.arguments) as ExplanationResult;
}
