import OpenAI from 'openai';
import type { PostTone, SocialPostResult } from './social-types';

let openaiInstance: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY environment variable is not set');
    openaiInstance = new OpenAI({ apiKey });
  }
  return openaiInstance;
}

const TONE_INSTRUCTIONS: Record<PostTone, string> = {
  professional: 'Write in a professional, analytical tone. Use precise language. Suitable for financial professionals and serious investors.',
  casual: 'Write in a casual, conversational tone. Use simple language, maybe an emoji or two. Make it feel like a friend explaining the data.',
  educational: 'Write in an educational tone. Explain what the data means and why it matters. Help people learn. Use a 🧵 emoji for threads.',
};

function buildSystemPrompt(tone: PostTone): string {
  return `You are a financial content writer creating social media posts about economic data from FRED (Federal Reserve Economic Data).

TONE: ${TONE_INSTRUCTIONS[tone]}

CRITICAL RULES:
1. You do NOT have access to actual data values — write about the indicators in general terms
2. Reference the chart title and series names, but do not fabricate specific numbers
3. Focus on WHY this data matters to everyday investors
4. Single tweets MUST be under 280 characters (including hashtags)
5. Thread tweets should each be under 280 characters
6. Always attribute data to FRED
7. Include "via FredDash" or "Made with FredDash" subtly
8. Hashtags should be relevant to the economic topic
9. LinkedIn posts can be up to 1300 characters and more detailed

GOOD HASHTAG EXAMPLES: #Economy #Inflation #FinTwit #EconTwitter #FedWatch #Jobs #Housing #GDP #InterestRates #Investing

DO NOT fabricate specific data values. Instead, describe the indicator and its significance.`;
}

const GENERATE_POST_TOOL: OpenAI.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'generate_social_post',
    description: 'Generate social media posts about an economic chart',
    parameters: {
      type: 'object',
      required: ['single_tweet', 'hashtags'],
      properties: {
        single_tweet: {
          type: 'string',
          description: 'A single tweet caption under 280 characters. Do not include hashtags in this — they are separate.',
        },
        thread: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional thread of 3-5 tweets, each under 280 characters. First tweet should hook the reader.',
        },
        hashtags: {
          type: 'array',
          items: { type: 'string' },
          description: '3-6 relevant hashtags WITHOUT the # symbol',
        },
        linkedin_post: {
          type: 'string',
          description: 'A LinkedIn post (up to 1300 chars). More professional and detailed than the tweet.',
        },
      },
    },
  },
};

export async function generateSocialPost(
  chartTitle: string,
  seriesLabels: string[],
  dateRange: string,
  tone: PostTone,
  includeThread: boolean,
  explanation?: string,
  chartSubtitle?: string,
): Promise<SocialPostResult> {
  const openai = getOpenAI();

  const userPrompt = `Generate a social media post for this economic chart:

Title: "${chartTitle}"
${chartSubtitle ? `Subtitle: "${chartSubtitle}"` : ''}
Indicators: ${seriesLabels.join(', ')}
Date Range: ${dateRange}
${explanation ? `Context: ${explanation}` : ''}

${includeThread ? 'Generate both a single tweet AND a 3-5 tweet thread.' : 'Generate a single tweet only.'}
Also generate a LinkedIn post.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: buildSystemPrompt(tone) },
      { role: 'user', content: userPrompt },
    ],
    tools: [GENERATE_POST_TOOL],
    tool_choice: { type: 'function', function: { name: 'generate_social_post' } },
    temperature: 0.7,
  });

  const toolCall = response.choices[0]?.message?.tool_calls?.[0];
  if (!toolCall || toolCall.type !== 'function') {
    throw new Error('AI did not generate a social post');
  }

  const result = JSON.parse(toolCall.function.arguments) as SocialPostResult;

  // Ensure hashtags have # prefix
  result.hashtags = result.hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`));

  return result;
}
