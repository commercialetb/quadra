import { NextResponse } from 'next/server';
import { suggestNextAction } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await suggestNextAction({
      company: body?.company,
      contact: body?.contact,
      opportunity: body?.opportunity,
      stage: body?.stage,
      note: body?.note,
    });

    return NextResponse.json({ suggestion: result.text });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
