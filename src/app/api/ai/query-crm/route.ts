import { NextResponse } from 'next/server';
import { answerCrmQuery } from '@/lib/ai/crm-query';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const question = String(body?.question || '').trim();

    if (!question) {
      return NextResponse.json({ error: 'Missing question' }, { status: 400 });
    }

    const result = await answerCrmQuery(question);

    return NextResponse.json({
      answer: result.answer,
      intent: result.intent,
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
