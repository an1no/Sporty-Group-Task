import { environment } from '../environments/environment';

export interface CacheConfig {
  // Time-to-live in minutes
  ttl: number;
  // Storage quota warning threshold (in MB)
  storageWarningThreshold: number;
  // Auto-cleanup old entries
  autoCleanup: boolean;
}

export interface CacheSettings {
  leagues: CacheConfig;
  badges: CacheConfig;
  searchResults: CacheConfig;
  default: CacheConfig;
}

export const CACHE_SETTINGS: CacheSettings = {
  leagues: {
    ttl: 24 * 60, // 24 hours
    storageWarningThreshold: 5, // 5MB
    autoCleanup: true
  },
  
  badges: {
    ttl: 7 * 24 * 60, // 7 days
    storageWarningThreshold: 50, // 50MB
    autoCleanup: true
  },
  
  searchResults: {
    ttl: 60, // 1 hour
    storageWarningThreshold: 2, // 2MB
    autoCleanup: true
  },
  
  default: {
    ttl: 60, // 1 hour
    storageWarningThreshold: 10, // 10MB
    autoCleanup: true
  }
};

// Environment-specific cache settings
export const getCacheSettings = (): CacheSettings => {
  // In development, use shorter cache times for testing
  if (!environment.production) {
    return {
      leagues: { ...CACHE_SETTINGS.leagues, ttl: 5 }, // 5 minutes in dev
      badges: { ...CACHE_SETTINGS.badges, ttl: 30 }, // 30 minutes in dev
      searchResults: { ...CACHE_SETTINGS.searchResults, ttl: 2 }, // 2 minutes in dev
      default: { ...CACHE_SETTINGS.default, ttl: 5 } // 5 minutes in dev
    };
  }
  
  return CACHE_SETTINGS;
};

// Helper to convert minutes to milliseconds
export const minutesToMs = (minutes: number): number => minutes * 60 * 1000;