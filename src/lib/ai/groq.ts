import { getAiConfig, getRequiredEnv } from './env';
import type {
  AiCompletionInput,
  AiCompletionResult,
  AiProviderAdapter,
} from './types';

type GroqResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

export class GroqAdapter implements AiProviderAdapter {
  async complete(input: AiCompletionInput): Promise<AiCompletionResult> {
    const cfg = getAiConfig();
    const apiKey = cfg.apiKey || getRequiredEnv('GROQ_API_KEY');

    const response = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: cfg.model,
        temperature: input.temperature ?? 0.2,
        max_tokens: input.maxTokens ?? 300,
        messages: input.messages,
        response_format: input.jsonMode ? { type: 'json_object' } : undefined,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Groq request failed: ${response.status} ${body}`);
    }

    const data = (await response.json()) as GroqResponse;
    const text = data.choices?.[0]?.message?.content?.trim() || '';

    return {
      text,
      raw: data,
    };
  }
}
