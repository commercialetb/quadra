export function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getAiConfig() {
  return {
    provider: (process.env.LLM_PROVIDER || 'groq') as 'groq',
    model: process.env.LLM_MODEL || 'llama-3.1-8b-instant',
    baseUrl: process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY || '',
  };
}
