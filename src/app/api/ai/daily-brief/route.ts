import { NextResponse } from 'next/server';
import { buildDailyBrief } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = await buildDailyBrief({
      overdueFollowups: Number(body?.overdueFollowups || 0),
      dueToday: Number(body?.dueToday || 0),
      openOpportunities: Number(body?.openOpportunities || 0),
      pipelineValue: Number(body?.pipelineValue || 0),
      highlights: Array.isArray(body?.highlights) ? body.highlights : [],
    });

    return NextResponse.json({ brief: result.text });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
