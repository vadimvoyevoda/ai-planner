/**
 * Environment utility to handle environment-specific configuration
 */

// Define allowed environment types
export type EnvironmentType = 'local' | 'integration' | 'prod';

/**
 * Get current environment name from PUBLIC_ENV_NAME
 * Defaults to 'local' if not set
 */
export const getEnvironmentName = (): EnvironmentType => {
  const envName = import.meta.env.PUBLIC_ENV_NAME as EnvironmentType;
  
  // Default to 'local' if undefined or invalid
  if (!envName || !['local', 'integration', 'prod'].includes(envName)) {
    return 'local';
  }
  
  return envName;
};

/**
 * Check if the current environment is a production environment
 */
export const isProductionEnvironment = (): boolean => {
  return getEnvironmentName() === 'prod';
};

/**
 * Check if the current environment is a development environment
 */
export const isDevelopmentEnvironment = (): boolean => {
  return ['local'].includes(getEnvironmentName());
};

/**
 * Check if the current environment is an integration environment
 */
export const isIntegrationEnvironment = (): boolean => {
  return getEnvironmentName() === 'integration';
};

/**
 * Get environment-specific configuration
 */
export const getEnvironmentConfig = () => {
  const env = getEnvironmentName();
  
  const config = {
    // Add environment-specific configuration here
    apiBaseUrl: {
      local: 'http://localhost:3000/api',
      integration: 'https://integration.example.com/api',
      prod: 'https://app.example.com/api',
    }[env],
    
    // Other environment-specific configurations
    featureFlags: {
      enableNewFeature: ['local', 'integration'].includes(env),
      debugMode: ['local'].includes(env),
    }
  };
  
  return config;
};

export default {
  getEnvironmentName,
  isProductionEnvironment,
  isDevelopmentEnvironment,
  isIntegrationEnvironment,
  getEnvironmentConfig,
}; 