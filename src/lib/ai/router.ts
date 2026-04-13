import { getRouterConfig } from './env';
import { GroqAdapter } from './providers/groq';
import { OpenAiAdapter } from './providers/openai';
import type { AiCompletionInput, AiCompletionResult, AiProvider, AiProviderAdapter } from './types';

function getAdapter(provider: AiProvider): AiProviderAdapter {
  switch (provider) {
    case 'openai':
      return new OpenAiAdapter();
    case 'groq':
    default:
      return new GroqAdapter();
  }
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string) {
  const timeoutPromise = new Promise<T>((_, reject) => {
    const timeoutId = setTimeout(() => {
      clearTimeout(timeoutId);
      reject(new Error(`${label} timeout after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

function hasUsableText(result: AiCompletionResult) {
  return result.text.trim().length >= 12;
}

export async function runAiWithFallback(input: AiCompletionInput): Promise<AiCompletionResult> {
  const cfg = getRouterConfig();
  const primaryAdapter = getAdapter(cfg.primaryProvider);

  try {
    const primaryResult = await withTimeout(
      primaryAdapter.complete(input),
      cfg.timeoutMs,
      `${cfg.primaryProvider} ${input.task}`
    );

    if (hasUsableText(primaryResult)) {
      return primaryResult;
    }

    if (!cfg.enableFallback || !cfg.fallbackProvider || cfg.fallbackProvider === cfg.primaryProvider) {
      return primaryResult;
    }
  } catch (error) {
    if (cfg.debug) {
      console.error('[AI primary failure]', error);
    }
    if (!cfg.enableFallback || !cfg.fallbackProvider || cfg.fallbackProvider === cfg.primaryProvider) {
      throw error;
    }
  }

  const fallbackAdapter = getAdapter(cfg.fallbackProvider);
  const fallbackResult = await withTimeout(
    fallbackAdapter.complete(input),
    cfg.timeoutMs,
    `${cfg.fallbackProvider} ${input.task}`
  );

  if (cfg.debug) {
    console.info('[AI fallback used]', {
      task: input.task,
      provider: fallbackResult.provider,
      model: fallbackResult.model,
    });
  }

  return fallbackResult;
}
