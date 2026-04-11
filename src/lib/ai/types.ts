export type AiProvider = 'groq';

export type AiTask =
  | 'summarize_note'
  | 'suggest_next_action'
  | 'daily_brief';

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
  raw?: unknown;
}

export interface AiProviderAdapter {
  complete(input: AiCompletionInput): Promise<AiCompletionResult>;
}
