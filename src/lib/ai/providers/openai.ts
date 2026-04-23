import { getOpenAiConfig, getRequiredEnv } from '../env';
import type { AiCompletionInput, AiCompletionResult, AiProviderAdapter } from '../types';

type OpenAiResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

export class OpenAiAdapter implements AiProviderAdapter {
  provider = 'openai' as const;
  model = getOpenAiConfig().model;

  async complete(input: AiCompletionInput): Promise<AiCompletionResult> {
    const cfg = getOpenAiConfig();
    const apiKey = cfg.apiKey || getRequiredEnv('OPENAI_API_KEY');

    const response = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: cfg.model,
        temperature: input.temperature ?? 0.2,
        max_tokens: input.maxTokens ?? 500,
        messages: input.messages,
        response_format: input.jsonMode ? { type: 'json_object' } : undefined,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`OpenAI request failed: ${response.status} ${body}`);
    }

    const data = (await response.json()) as OpenAiResponse;
    const text = data.choices?.[0]?.message?.content?.trim() || '';

    return {
      text,
      provider: this.provider,
      model: cfg.model,
      raw: data,
    };
  }
}
