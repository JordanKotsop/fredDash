import { NextResponse } from 'next/server';

export interface KeyStatus {
  fred: boolean;
  openai: boolean;
  allConfigured: boolean;
}

export async function GET() {
  const fred = !!process.env.FRED_API_KEY && process.env.FRED_API_KEY !== 'your_api_key_here';
  const openai = !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here';

  return NextResponse.json<KeyStatus>({
    fred,
    openai,
    allConfigured: fred && openai,
  });
}
