export type AiProvider = 'groq' | 'openai';

export type AiTask =
  | 'summarize_note'
  | 'suggest_next_action'
  | 'daily_brief'
  | 'parse_note'
  | 'generate_message'
  | 'query_crm'
  | 'extract_siri_followup';

export interface AiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiCompletionInput {
  task: AiTask;
  messages: AiMessage[];
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export interface AiCompletionResult {
  text: string;
  provider: AiProvider;
  model: string;
  raw?: unknown;
}

export interface AiProviderAdapter {
  provider: AiProvider;
  model: string;
  complete(input: AiCompletionInput): Promise<AiCompletionResult>;
}

export interface AiRouterConfig {
  primaryProvider: AiProvider;
  fallbackProvider?: AiProvider;
  timeoutMs: number;
  enableFallback: boolean;
  debug: boolean;
}

export type ParsedNoteResult = {
  summary: string;
  followUpTitle: string;
  followUpDueHint: string;
  priority: 'low' | 'medium' | 'high';
  opportunitySignal: 'negative' | 'neutral' | 'positive';
  suggestedStatusUpdate: string;
};
