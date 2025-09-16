import { environment } from '../environments/environment';

export interface ApiConfig {
  baseUrl: string;
  endpoints: {
    leagues: string;
    seasons: string;
  };
}

export const API_CONFIG: ApiConfig = {
  baseUrl: environment.apiUrl,
  endpoints: {
    leagues: '/all_leagues.php',
    seasons: '/search_all_seasons.php'
  }
};

// Alternative configurations for different environments
export const API_CONFIGS = {
  production: API_CONFIG,
  
  development: {
    ...API_CONFIG,
    // Could point to a mock server or staging API in development
  },
  
  test: {
    baseUrl: 'http://localhost:3000/api/v1/json/3',
    endpoints: {
      leagues: '/all_leagues.php',
      seasons: '/search_all_seasons.php'
    }
  }
} as const;

// Get config based on environment
export function getApiConfig(): ApiConfig {
  return API_CONFIG;
}