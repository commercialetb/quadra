import { NextResponse } from 'next/server';
import { parseNoteToCrmStructure } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const note = String(body?.note || '').trim();

    if (!note) {
      return NextResponse.json({ error: 'Missing note' }, { status: 400 });
    }

    const { result, parsed } = await parseNoteToCrmStructure(note);

    return NextResponse.json({
      parsed,
      provider: result.provider,
      model: result.model,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
