import type { AiProvider, AiRouterConfig } from './types';

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (value == null) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

function parseNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getRouterConfig(): AiRouterConfig {
  const primaryProvider = (process.env.LLM_PROVIDER || 'groq') as AiProvider;
  const fallbackRaw = process.env.LLM_FALLBACK_PROVIDER?.trim();
  const fallbackProvider = fallbackRaw ? (fallbackRaw as AiProvider) : undefined;

  return {
    primaryProvider,
    fallbackProvider,
    timeoutMs: parseNumber(process.env.LLM_TIMEOUT_MS, 12000),
    enableFallback: parseBoolean(process.env.LLM_ENABLE_FALLBACK, true),
    debug: parseBoolean(process.env.LLM_DEBUG, false),
  };
}

export function getGroqConfig() {
  return {
    provider: 'groq' as const,
    model: process.env.LLM_MODEL || 'llama-3.1-8b-instant',
    baseUrl: process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY || '',
  };
}

export function getOpenAiConfig() {
  return {
    provider: 'openai' as const,
    model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
    baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    apiKey: process.env.OPENAI_API_KEY || '',
  };
}
