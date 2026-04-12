import { getAiConfig } from './env';
import { GroqAdapter } from './groq';
import type { AiCompletionInput } from './types';

function getAdapter() {
  const cfg = getAiConfig();

  switch (cfg.provider) {
    case 'groq':
    default:
      return new GroqAdapter();
  }
}

export async function runAiCompletion(input: AiCompletionInput) {
  const adapter = getAdapter();
  return adapter.complete(input);
}

export async function summarizeNote(note: string) {
  return runAiCompletion({
    task: 'summarize_note',
    maxTokens: 180,
    messages: [
      {
        role: 'system',
        content:
          'You are Quadra, a concise CRM assistant. Summarize the note in clean business Italian. Keep it short, actionable, and factual.',
      },
      {
        role: 'user',
        content: note,
      },
    ],
  });
}

export async function suggestNextAction(context: {
  company?: string;
  contact?: string;
  opportunity?: string;
  stage?: string;
  note?: string;
}) {
  return runAiCompletion({
    task: 'suggest_next_action',
    maxTokens: 220,
    messages: [
      {
        role: 'system',
        content:
          'You are Quadra, a CRM copilot. Suggest the single best next action in Italian, practical and short. Then give a short reason.',
      },
      {
        role: 'user',
        content: JSON.stringify(context, null, 2),
      },
    ],
  });
}

export async function buildDailyBrief(context: {
  overdueFollowups: number;
  dueToday: number;
  openOpportunities: number;
  pipelineValue?: number;
  highlights?: string[];
}) {
  return runAiCompletion({
    task: 'daily_brief',
    maxTokens: 260,
    messages: [
      {
        role: 'system',
        content:
          'You are Quadra, a daily CRM briefing assistant. Write a short Italian morning brief, calm and executive, with priorities first.',
      },
      {
        role: 'user',
        content: JSON.stringify(context, null, 2),
      },
    ],
  });
}
