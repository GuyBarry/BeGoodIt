import { requireEnv } from './env';

export const geminiConfig = {
  apiKey: requireEnv('GEMINI_API_KEY', ''),
};
