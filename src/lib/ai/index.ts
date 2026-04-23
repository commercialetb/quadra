import { runAiWithFallback } from './router';
import type { AiCompletionInput, ParsedNoteResult } from './types';

function safeJsonParse<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export async function runAiCompletion(input: AiCompletionInput) {
  return runAiWithFallback(input);
}

export async function summarizeNote(note: string) {
  return runAiCompletion({
    task: 'summarize_note',
    maxTokens: 220,
    messages: [
      {
        role: 'system',
        content:
          'Sei Quadra, un assistente CRM conciso. Riassumi la nota in italiano business, in massimo 4 righe, restando fattuale e operativo.',
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
  valueEstimate?: number | null;
  probability?: number | null;
  nextActionDueAt?: string | null;
  openFollowups?: Array<{ title: string; due_at?: string | null; priority?: string | null; status?: string | null }>;
}) {
  return runAiCompletion({
    task: 'suggest_next_action',
    maxTokens: 280,
    messages: [
      {
        role: 'system',
        content:
          'Sei Quadra, copilota CRM operativo. Rispondi in italiano. Dai: 1) prossima azione consigliata, 2) motivo breve, 3) bozza di follow-up in una riga. Sii concreto e non verboso.',
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
  staleOpportunities?: Array<{ title: string; stage?: string | null; updated_at?: string | null }>;
  highlights?: string[];
}) {
  return runAiCompletion({
    task: 'daily_brief',
    maxTokens: 320,
    messages: [
      {
        role: 'system',
        content:
          'Sei Quadra, assistente CRM. Scrivi un brief giornaliero in italiano con questo schema: Priorita di oggi, Rischi, Focus commerciale. Mantieni tono executive e molto pratico.',
      },
      {
        role: 'user',
        content: JSON.stringify(context, null, 2),
      },
    ],
  });
}

export async function parseNoteToCrmStructure(note: string) {
  const result = await runAiCompletion({
    task: 'parse_note',
    maxTokens: 350,
    jsonMode: true,
    messages: [
      {
        role: 'system',
        content:
          'Estrai da questa nota un JSON valido con le chiavi: summary, followUpTitle, followUpDueHint, priority, opportunitySignal, suggestedStatusUpdate. priority deve essere low, medium o high. opportunitySignal deve essere negative, neutral o positive. Rispondi solo con JSON.',
      },
      {
        role: 'user',
        content: note,
      },
    ],
  });

  const parsed = safeJsonParse<ParsedNoteResult>(result.text);

  return {
    result,
    parsed: parsed ?? {
      summary: result.text,
      followUpTitle: 'Verificare manualmente la prossima azione',
      followUpDueHint: 'Da definire',
      priority: 'medium',
      opportunitySignal: 'neutral',
      suggestedStatusUpdate: 'Nessun aggiornamento automatico consigliato',
    },
  };
}

export async function generateAssistedMessage(context: {
  messageType: 'email' | 'whatsapp' | 'followup' | 'recap';
  tone?: 'formale' | 'diretto' | 'caldo' | 'commerciale';
  company?: string;
  contact?: string;
  opportunity?: string;
  objective?: string;
  notes?: string;
}) {
  return runAiCompletion({
    task: 'generate_message',
    maxTokens: 420,
    messages: [
      {
        role: 'system',
        content:
          'Sei Quadra, assistente commerciale. Scrivi un messaggio in italiano, pronto da copiare, coerente con il tipo richiesto. Mantieni tono professionale e concreto.',
      },
      {
        role: 'user',
        content: JSON.stringify(context, null, 2),
      },
    ],
  });
}

type SiriFollowupExtract = {
  personName: string | null
  companyName: string | null
  summary: string
  followUpTitle: string
  dueDateISO: string | null
  priority: 'low' | 'medium' | 'high'
  statusSignal: string | null
  reminderTitle: string
  reminderNotes: string
}

export async function extractSiriFollowup(note: string) {
  const today = new Date().toISOString().slice(0, 10)
  const result = await runAiCompletion({
    task: 'extract_siri_followup',
    maxTokens: 420,
    jsonMode: true,
    messages: [
      {
        role: 'system',
        content:
          `Sei Quadra. Estrai da questa nota vocale un JSON valido con le chiavi: personName, companyName, summary, followUpTitle, dueDateISO, priority, statusSignal, reminderTitle, reminderNotes. priority deve essere low, medium o high. dueDateISO deve essere in formato YYYY-MM-DD quando la data e chiara, altrimenti null. Oggi e ${today}. Non inventare dati. Rispondi solo con JSON.`,
      },
      {
        role: 'user',
        content: note,
      },
    ],
  })

  const parsed = safeJsonParse<SiriFollowupExtract>(result.text)

  return {
    result,
    parsed: parsed ?? {
      personName: null,
      companyName: null,
      summary: note,
      followUpTitle: 'Richiamare il contatto',
      dueDateISO: null,
      priority: 'medium',
      statusSignal: null,
      reminderTitle: 'Follow-up da verificare',
      reminderNotes: note,
    },
  }
}
