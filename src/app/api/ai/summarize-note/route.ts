import { NextResponse } from 'next/server';
import { summarizeNote } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const note = String(body?.note || '').trim();

    if (!note) {
      return NextResponse.json({ error: 'Missing note' }, { status: 400 });
    }

    const result = await summarizeNote(note);
    return NextResponse.json({ summary: result.text });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
