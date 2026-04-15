import { NextResponse } from 'next/server';
import { generateAssistedMessage } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messageType = body?.messageType;

    if (!messageType) {
      return NextResponse.json({ error: 'Missing messageType' }, { status: 400 });
    }

    const result = await generateAssistedMessage({
      messageType,
      tone: body?.tone,
      company: body?.company,
      contact: body?.contact,
      opportunity: body?.opportunity,
      objective: body?.objective,
      notes: body?.notes,
    });

    return NextResponse.json({
      message: result.text,
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
