/**
 * Determines whether the frontend service layer should hit real APIs
 * or fall back to in-memory / localStorage mock data.
 *
 * Live mode is active when:
 *  1. Running in production, OR
 *  2. The NEXT_PUBLIC_USE_LIVE_API env flag is explicitly set to 'true'
 *
 * In development without the flag, services use mock data so the frontend
 * can run independently of a running backend.
 */

import { envConfig } from '@/config/env';

const forceLive =
  typeof process !== 'undefined' &&
  process.env?.NEXT_PUBLIC_USE_LIVE_API === 'true';

export function isLiveMode(): boolean {
  return envConfig.isProduction || forceLive;
}
