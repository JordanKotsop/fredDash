import { NextRequest, NextResponse } from 'next/server';

interface ValidationResult {
  fred: { valid: boolean; error?: string } | null;
  openai: { valid: boolean; error?: string } | null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fredKey, openaiKey } = body;

    const result: ValidationResult = { fred: null, openai: null };

    // Validate FRED key
    if (fredKey) {
      try {
        const res = await fetch(
          `https://api.stlouisfed.org/fred/series?series_id=GNPCA&api_key=${encodeURIComponent(fredKey)}&file_type=json`,
          { cache: 'no-store' }
        );
        if (res.ok) {
          result.fred = { valid: true };
        } else {
          const text = await res.text();
          result.fred = { valid: false, error: res.status === 400 ? 'Invalid API key' : `FRED error: ${text.slice(0, 100)}` };
        }
      } catch (err) {
        result.fred = { valid: false, error: err instanceof Error ? err.message : 'Connection failed' };
      }
    }

    // Validate OpenAI key
    if (openaiKey) {
      try {
        const res = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${openaiKey}` },
          cache: 'no-store',
        });
        if (res.ok) {
          result.openai = { valid: true };
        } else if (res.status === 401) {
          result.openai = { valid: false, error: 'Invalid API key' };
        } else {
          result.openai = { valid: false, error: `OpenAI error: ${res.status}` };
        }
      } catch (err) {
        result.openai = { valid: false, error: err instanceof Error ? err.message : 'Connection failed' };
      }
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ fred: null, openai: null, error: 'Invalid request' }, { status: 400 });
  }
}
