/**
 * Centralized strongly-typed frontend environment configuration.
 * Exposes ONLY safe public NEXT_PUBLIC_* variables to client components.
 */

export type AppEnvironment = 'development' | 'test' | 'staging' | 'production';

export interface FrontendEnvConfig {
  readonly apiBaseUrl: string;
  readonly apiVersion: string;
  readonly appEnv: AppEnvironment;
  readonly isDevelopment: boolean;
  readonly isProduction: boolean;
  readonly isTest: boolean;
}

/**
 * Cleanly strips leading, trailing, and duplicate slashes.
 */
export function normalizeApiUrl(
  baseUrl: string,
  version: string,
  path: string = ''
): string {
  // Normalize base
  const cleanBase = baseUrl.trim().replace(/\/+$/, '');
  const cleanVersion = version.trim().replace(/^\/+|\/+$/g, '');
  
  // Normalize path
  let cleanPath = path.trim().replace(/^\/+/, '');
  
  // If path already starts with api/{version} or /api/{version}, don't duplicate it
  const apiVersionPrefix = `api/${cleanVersion}/`;
  if (cleanPath.startsWith(apiVersionPrefix)) {
    cleanPath = cleanPath.slice(apiVersionPrefix.length);
  } else if (cleanPath === `api/${cleanVersion}`) {
    cleanPath = '';
  }

  // Construct canonical base API route
  const apiRoot = `${cleanBase}/api/${cleanVersion}`;
  if (!cleanPath) {
    return apiRoot;
  }

  return `${apiRoot}/${cleanPath}`;
}

const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
const rawApiVersion = process.env.NEXT_PUBLIC_API_VERSION || 'v1';
const rawAppEnv = (process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || 'development') as AppEnvironment;

export const envConfig: FrontendEnvConfig = Object.freeze({
  apiBaseUrl: rawBaseUrl,
  apiVersion: rawApiVersion,
  appEnv: rawAppEnv,
  isDevelopment: rawAppEnv === 'development',
  isProduction: rawAppEnv === 'production',
  isTest: rawAppEnv === 'test',
});

/**
 * Returns canonical endpoint URL for a given relative path.
 * Example: getApiUrl('/customer/profile') -> 'http://localhost:4000/api/v1/customer/profile'
 */
export function getApiUrl(path: string = ''): string {
  return normalizeApiUrl(envConfig.apiBaseUrl, envConfig.apiVersion, path);
}
