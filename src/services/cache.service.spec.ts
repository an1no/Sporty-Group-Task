import { TestBed } from '@angular/core/testing';
import { CacheService } from './cache.service';
import { of } from 'rxjs';

// Mock Dexie for testing
class MockDexie {
  private storeData = new Map();

  constructor() {
    this.storeData.set('leagues', new Map());
    this.storeData.set('badges', new Map());
    this.storeData.set('searchResults', new Map());
  }

  version(num: number) {
    return this;
  }

  defineStores(config: any) {
    return this;
  }

  open() {
    return Promise.resolve();
  }

  table(name: string) {
    const store = this.storeData.get(name) || new Map();
    return {
      put: (item: any) => {
        store.set(item.key, item);
        return Promise.resolve();
      },
      get: (key: string) => {
        return Promise.resolve(store.get(key));
      },
      where: (field: string) => ({
        equals: (value: any) => ({
          delete: () => {
            const toDelete: string[] = [];
            for (const [key, item] of store.entries()) {
              if (item[field] === value) {
                toDelete.push(key);
              }
            }
            toDelete.forEach(key => store.delete(key));
            return Promise.resolve(toDelete.length);
          }
        })
      }),
      clear: () => {
        const count = store.size;
        store.clear();
        return Promise.resolve(count);
      },
      count: () => Promise.resolve(store.size),
      toArray: () => Promise.resolve([...store.values()]),
      filter: (predicate: (item: any) => boolean) => ({
        delete: () => {
          const toDelete: string[] = [];
          for (const [key, item] of store.entries()) {
            if (predicate(item)) {
              toDelete.push(key);
            }
          }
          toDelete.forEach(key => store.delete(key));
          return Promise.resolve(toDelete.length);
        }
      })
    };
  }

  remove() {
    this.storeData.clear();
    return Promise.resolve();
  }
}

describe('CacheService', () => {
  let service: CacheService;
  let mockDexie: MockDexie;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CacheService]
    });

    // Create a properly mocked service
    service = new CacheService();
    
    // Mock the internal Dexie methods
    mockDexie = new MockDexie();
    spyOn(service as any, 'table').and.callFake((name: string) => mockDexie.table(name));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should store data in cache', (done) => {
    const testData = { name: 'Premier League', sport: 'Soccer' };
    
    service.set('leagues', 'test-key', testData).subscribe(() => {
      service.get('leagues', 'test-key').subscribe(result => {
        expect(result).toEqual(testData);
        done();
      });
    });
  });

  it('should return null for non-existent cache key', (done) => {
    service.get('leagues', 'non-existent-key').subscribe(result => {
      expect(result).toBeNull();
      done();
    });
  });

  it('should return null for expired cache entries', (done) => {
    const testData = { name: 'Test League' };
    const pastTimestamp = Date.now() - 1000; // 1 second ago
    
    // Manually set expired data
    const expiredEntry = {
      key: 'expired-key',
      data: testData,
      timestamp: pastTimestamp,
      storeName: 'leagues'
    };

    mockDexie.table('leagues').put(expiredEntry).then(() => {
      service.get('leagues', 'expired-key').subscribe(result => {
        expect(result).toBeNull();
        done();
      });
    });
  });

  it('should clear specific store cache', (done) => {
    const testData = { name: 'Test League' };
    
    service.set('leagues', 'test-key', testData).subscribe(() => {
      service.clear('leagues').subscribe(() => {
        service.get('leagues', 'test-key').subscribe(result => {
          expect(result).toBeNull();
          done();
        });
      });
    });
  });

  it('should cleanup expired entries', (done) => {
    const currentData = { name: 'Current League' };
    const expiredData = { name: 'Expired League' };
    
    // Add current data
    service.set('leagues', 'current-key', currentData).subscribe(() => {
      // Manually add expired data
      const expiredEntry = {
        key: 'expired-key',
        data: expiredData,
        timestamp: Date.now() - 100000, // Far in the past
        storeName: 'leagues'
      };

      mockDexie.table('leagues').put(expiredEntry).then(() => {
        service.cleanup().subscribe(cleanedCount => {
          expect(cleanedCount).toBeGreaterThan(0);
          
          // Verify expired data is gone but current data remains
          service.get('leagues', 'expired-key').subscribe(expiredResult => {
            expect(expiredResult).toBeNull();
            
            service.get('leagues', 'current-key').subscribe(currentResult => {
              expect(currentResult).toEqual(currentData);
              done();
            });
          });
        });
      });
    });
  });

  it('should return cache statistics', (done) => {
    const testData1 = { name: 'League 1' };
    const testData2 = { name: 'Badge 1' };
    
    service.set('leagues', 'league-1', testData1).subscribe(() => {
      service.set('badges', 'badge-1', testData2).subscribe(() => {
        service.getStats().subscribe(stats => {
          expect(stats).toBeDefined();
          expect(stats['leagues']).toBeDefined();
          expect(stats['badges']).toBeDefined();
          expect(stats['leagues'].count).toBe(1);
          expect(stats['badges'].count).toBe(1);
          done();
        });
      });
    });
  });

  it('should handle cache operations for different store types', (done) => {
    const leagueData = { name: 'Premier League' };
    const badgeData = 'https://example.com/badge.png';
    const searchData = ['result1', 'result2'];
    
    service.set('leagues', 'league-key', leagueData).subscribe(() => {
      service.set('badges', 'badge-key', badgeData).subscribe(() => {
        service.set('searchResults', 'search-key', searchData).subscribe(() => {
          // Verify all data was stored correctly
          service.get('leagues', 'league-key').subscribe(league => {
            expect(league).toEqual(leagueData);
            
            service.get('badges', 'badge-key').subscribe(badge => {
              expect(badge).toEqual(badgeData);
              
              service.get('searchResults', 'search-key').subscribe(search => {
                expect(search).toEqual(searchData);
                done();
              });
            });
          });
        });
      });
    });
  });

  it('should handle errors gracefully', (done) => {
    // Mock an error scenario
    spyOn(mockDexie, 'table').and.throwError('Database error');
    
    service.get('leagues', 'test-key').subscribe(
      result => {
        expect(result).toBeNull();
        done();
      },
      error => {
        // Should not reach here as errors should be caught
        fail('Should not throw error');
      }
    );
  });

  it('should calculate data size correctly', (done) => {
    const largeData = { 
      name: 'Large League',
      description: 'A'.repeat(1000), // 1000 character string
      teams: new Array(50).fill({ name: 'Team', players: new Array(20).fill('Player') })
    };
    
    service.set('leagues', 'large-key', largeData).subscribe(() => {
      service.getStats().subscribe(stats => {
        expect(stats['leagues'].size).toBeGreaterThan(0);
        done();
      });
    });
  });

  it('should respect TTL configuration', (done) => {
    const testData = { name: 'TTL Test League' };
    
    service.set('leagues', 'ttl-key', testData).subscribe(() => {
      // Immediately check - should be available
      service.get('leagues', 'ttl-key').subscribe(result => {
        expect(result).toEqual(testData);
        
        // Mock an expired timestamp by directly modifying the cached entry
        const expiredEntry = {
          key: 'ttl-key',
          data: testData,
          timestamp: Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago (expired)
          storeName: 'leagues'
        };
        
        mockDexie.table('leagues').put(expiredEntry).then(() => {
          service.get('leagues', 'ttl-key').subscribe(expiredResult => {
            expect(expiredResult).toBeNull();
            done();
          });
        });
      });
    });
  });

  it('should clear all cache stores', (done) => {
    const leagueData = { name: 'League' };
    const badgeData = 'badge-url';
    
    service.set('leagues', 'key1', leagueData).subscribe(() => {
      service.set('badges', 'key2', badgeData).subscribe(() => {
        // Clear all caches
        service.clear('leagues').subscribe(() => {
          service.clear('badges').subscribe(() => {
            service.clear('searchResults').subscribe(() => {
              service.getStats().subscribe(stats => {
                expect(stats['leagues'].count).toBe(0);
                expect(stats['badges'].count).toBe(0);
                expect(stats['searchResults'].count).toBe(0);
                done();
              });
            });
          });
        });
      });
    });
  });
});