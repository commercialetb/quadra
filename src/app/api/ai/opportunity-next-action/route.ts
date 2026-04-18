import { NextResponse } from 'next/server';
import { suggestNextAction } from '@/lib/ai';
import { getOpportunityDetail } from '@/lib/detail-queries';
import { getFollowups } from '@/lib/data';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { opportunityId?: string };
    const opportunityId = String(body?.opportunityId || '').trim();

    if (!opportunityId) {
      return NextResponse.json({ error: 'Missing opportunityId' }, { status: 400 });
    }

    const [{ opportunity, notes }, followups] = await Promise.all([
      getOpportunityDetail(opportunityId),
      getFollowups(),
    ]);

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    const relatedFollowups = followups
      .filter((item) => item.opportunity_id === opportunityId)
      .slice(0, 6)
      .map((item) => ({
        title: item.title,
        due_at: item.due_at,
        priority: item.priority,
        status: item.status,
      }));

    const recentNote = notes[0]?.body || notes[0]?.title || '';

    const result = await suggestNextAction({
      company: opportunity.company?.name,
      contact: opportunity.primary_contact?.full_name,
      opportunity: opportunity.title,
      stage: opportunity.stage,
      note: recentNote,
      valueEstimate: opportunity.value_estimate,
      probability: opportunity.probability,
      nextActionDueAt: opportunity.next_action_due_at,
      openFollowups: relatedFollowups,
    });

    return NextResponse.json({
      suggestion: result.text,
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
