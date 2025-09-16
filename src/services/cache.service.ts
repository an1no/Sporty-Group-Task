import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { Observable, from, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { getCacheSettings, minutesToMs, CacheConfig } from '../config/cache.config';

export interface CacheItem<T = any> {
  id?: number;
  key: string;
  data: T;
  timestamp: number;
  expiry: number;
  storeName: string;
}

type CacheStoreName = 'leagues' | 'badges' | 'searchResults';

@Injectable({
  providedIn: 'root'
})
export class CacheService extends Dexie {
  // Define tables
  leagues!: Table<CacheItem, number>;
  badges!: Table<CacheItem, number>;
  searchResults!: Table<CacheItem, number>;

  private cacheSettings = getCacheSettings();

  constructor() {
    super('SportsLeaguesCache');
    this.version(1).stores({
      leagues: '++id, key, timestamp, expiry',
      badges: '++id, key, timestamp, expiry',
      searchResults: '++id, key, timestamp, expiry'
    });

    // Auto-cleanup on initialization
    this.initCleanup();
  }

  /**
   * Set cache item with configurable TTL
   */
  set<T>(storeName: CacheStoreName, key: string, data: T, customTtlMinutes?: number): Observable<void> {
    const config = this.cacheSettings[storeName] || this.cacheSettings.default;
    const ttlMinutes = customTtlMinutes ?? config.ttl;
    
    const cacheItem: CacheItem<T> = {
      key,
      data,
      timestamp: Date.now(),
      expiry: Date.now() + minutesToMs(ttlMinutes),
      storeName
    };

    return from(this.setItemInStore(storeName, cacheItem)).pipe(
      catchError(error => {
        console.error(`Failed to cache item ${key} in ${storeName}:`, error);
        return of(undefined);
      }),
      map(() => void 0)
    );
  }

  /**
   * Get cache item with automatic expiry check
   */
  get<T>(storeName: CacheStoreName, key: string): Observable<T | null> {
    return from(this.getItemFromStore<T>(storeName, key)).pipe(
      catchError(error => {
        console.error(`Failed to get cached item ${key} from ${storeName}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Delete specific cache item
   */
  remove(storeName: CacheStoreName, key: string): Observable<void> {
    return from(this.removeItemFromStore(storeName, key)).pipe(
      catchError(error => {
        console.error(`Failed to delete item ${key} from ${storeName}:`, error);
        return of(undefined);
      }),
      map(() => void 0)
    );
  }

  /**
   * Clear entire store
   */
  clear(storeName: CacheStoreName): Observable<void> {
    return from(this.clearStore(storeName)).pipe(
      catchError(error => {
        console.error(`Failed to clear store ${storeName}:`, error);
        return of(undefined);
      }),
      map(() => void 0)
    );
  }

  /**
   * Get cache statistics
   */
  getStats(): Observable<{ [storeName: string]: { count: number; size: number } }> {
    return from(this.getCacheStats()).pipe(
      catchError(error => {
        console.error('Failed to get cache stats:', error);
        return of({});
      })
    );
  }

  /**
   * Manual cleanup of expired items
   */
  cleanup(): Observable<number> {
    return from(this.cleanupExpired()).pipe(
      catchError(error => {
        console.error('Failed to cleanup expired items:', error);
        return of(0);
      })
    );
  }

  // Private methods for actual Dexie operations
  private async setItemInStore<T>(storeName: CacheStoreName, item: CacheItem<T>): Promise<void> {
    const table = this.getTable(storeName);
    
    // Delete existing item with same key first
    await table.where('key').equals(item.key).delete();
    
    // Add new item
    await table.add(item);
    
    // Check if we need cleanup
    const config = this.cacheSettings[storeName];
    if (config.autoCleanup) {
      this.scheduleCleanup();
    }
  }

  private async getItemFromStore<T>(storeName: CacheStoreName, key: string): Promise<T | null> {
    const table = this.getTable(storeName);
    const item = await table.where('key').equals(key).first();
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiry) {
      await table.delete(item.id!);
      return null;
    }

    return item.data as T;
  }

  private async removeItemFromStore(storeName: CacheStoreName, key: string): Promise<void> {
    const table = this.getTable(storeName);
    await table.where('key').equals(key).delete();
  }

  private async clearStore(storeName: CacheStoreName): Promise<void> {
    const table = this.getTable(storeName);
    await table.clear();
  }

  private async getCacheStats(): Promise<{ [storeName: string]: { count: number; size: number } }> {
    const stats: { [storeName: string]: { count: number; size: number } } = {};
    const storeNames: CacheStoreName[] = ['leagues', 'badges', 'searchResults'];
    
    for (const storeName of storeNames) {
      const table = this.getTable(storeName);
      const items = await table.toArray();
      
      stats[storeName] = {
        count: items.length,
        size: this.calculateSize(items)
      };
    }
    
    return stats;
  }

  private async cleanupExpired(): Promise<number> {
    const now = Date.now();
    let totalDeleted = 0;
    const storeNames: CacheStoreName[] = ['leagues', 'badges', 'searchResults'];
    
    for (const storeName of storeNames) {
      const table = this.getTable(storeName);
      const deleted = await table.where('expiry').below(now).delete();
      totalDeleted += deleted;
    }
    
    console.log(`Cleaned up ${totalDeleted} expired cache items`);
    return totalDeleted;
  }

  private getTable(storeName: CacheStoreName): Table<CacheItem, number> {
    switch (storeName) {
      case 'leagues':
        return this.leagues;
      case 'badges':
        return this.badges;
      case 'searchResults':
        return this.searchResults;
      default:
        throw new Error(`Unknown store name: ${storeName}`);
    }
  }

  private calculateSize(items: CacheItem[]): number {
    // Rough estimation of data size in bytes
    return items.reduce((size, item) => {
      const itemString = JSON.stringify(item);
      return size + itemString.length * 2; // 2 bytes per character for UTF-16
    }, 0);
  }

  private scheduleCleanup(): void {
    // Debounced cleanup - only run once every 5 minutes
    if (!this.cleanupTimeout) {
      this.cleanupTimeout = setTimeout(() => {
        this.cleanupExpired();
        this.cleanupTimeout = null;
      }, 5 * 60 * 1000); // 5 minutes
    }
  }

  private cleanupTimeout: any = null;

  private async initCleanup(): Promise<void> {
    try {
      // Initial cleanup on app start
      await this.cleanupExpired();
    } catch (error) {
      console.error('Initial cleanup failed:', error);
    }
  }
}