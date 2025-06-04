/**
 * Utility functions for accessing environment variables in CloudFlare
 */

/**
 * Gets an environment variable with fallbacks for CloudFlare
 */
export function getCloudflareEnv(name: string): string | undefined {
  // Try standard import.meta.env access
  if (import.meta.env[name]) {
    return import.meta.env[name];
  }
  
  // Try accessing as variable with different prefix patterns
  const variations = [
    name,
    `PUBLIC_${name}`,
    `VITE_${name}`,
    name.toUpperCase(),
    `PUBLIC_${name.toUpperCase()}`,
    `VITE_${name.toUpperCase()}`
  ];
  
  for (const key of variations) {
    if (import.meta.env[key]) {
      return import.meta.env[key];
    }
  }
  
  // In CloudFlare Functions, try accessing through the global context
  try {
    // @ts-expect-error - Access process in a way that won't trigger TypeScript errors
    const processEnv = typeof process !== 'undefined' ? process.env : undefined;
    
    if (processEnv) {
      for (const key of variations) {
        if (processEnv[key]) {
          return processEnv[key];
        }
      }
    }
  } catch (e) {
    // Ignore errors when process is not available
  }
  
  // Fallback - not found
  return undefined;
}

/**
 * Gets the OpenAI API key with fallbacks for different environment variable names
 * Only looks for OpenAI keys, not OpenRouter
 */
export function getOpenAIKey(): string | undefined {
  return (
    getCloudflareEnv('PLATFORM_OPENAI_KEY') || 
    getCloudflareEnv('OPENAI_API_KEY')
  );
} 