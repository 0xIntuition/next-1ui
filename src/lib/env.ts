/**
 * Environment variable configuration with type safety
 */

// Server-side environment variables
export const serverEnv = {
  MULTIVAULT_ADDRESS: process.env.MULTIVAULT_ADDRESS,
  PRIVATE_KEY: process.env.PRIVATE_KEY,
  PUBLIC_KEY: process.env.PUBLIC_KEY,
  ENVIRONMENT: process.env.ENVIRONMENT,
  DYNAMIC_API_KEY: process.env.DYNAMIC_API_KEY,
  DYNAMIC_PUBLIC_KEY: process.env.DYNAMIC_PUBLIC_KEY,
  DYNAMIC_ENVIRONMENT_ID: process.env.DYNAMIC_ENVIRONMENT_ID,
} as const;

// Client-side environment variables
export const clientEnv = {
  MULTIVAULT_ADDRESS: process.env.NEXT_PUBLIC_MULTIVAULT_ADDRESS,
  ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
  DYNAMIC_ENVIRONMENT_ID: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID,
} as const;

// Type for server environment
export type ServerEnv = typeof serverEnv;

// Type for client environment
export type ClientEnv = typeof clientEnv;

// Validate server environment variables
export function validateServerEnv(): void {
  const requiredServerVars = [
    'MULTIVAULT_ADDRESS',
    'PRIVATE_KEY',
    'PUBLIC_KEY',
    'ENVIRONMENT',
    'DYNAMIC_API_KEY',
    'DYNAMIC_PUBLIC_KEY',
    'DYNAMIC_ENVIRONMENT_ID',
  ] as const;

  for (const key of requiredServerVars) {
    if (!serverEnv[key]) {
      throw new Error(`Missing required server environment variable: ${key}`);
    }
  }
}

// Validate client environment variables
export function validateClientEnv(): void {
  const requiredClientVars = [
    'MULTIVAULT_ADDRESS',
    'ENVIRONMENT',
    'DYNAMIC_ENVIRONMENT_ID',
  ] as const;

  for (const key of requiredClientVars) {
    if (!clientEnv[key]) {
      throw new Error(`Missing required client environment variable: ${key}`);
    }
  }
} 