import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, shareReplay, switchMap } from 'rxjs/operators';
import { League, LeaguesResponse } from '../models/league.model';
import { SeasonsResponse } from '../models/season.model';
import { getApiConfig } from '../config/api.config';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root',
})
export class SportsService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = getApiConfig();
  private readonly cacheService = inject(CacheService);

  private leaguesCache$: Observable<League[]> | null = null;
  private readonly badgeCache = new Map<string, Observable<string | null>>();

  getLeagues(): Observable<League[]> {
    if (!this.leaguesCache$) {
      this.leaguesCache$ = this.cacheService.get<League[]>('leagues', 'all-leagues').pipe(
        switchMap(cachedLeagues => {
          if (cachedLeagues) {
            return of(cachedLeagues);
          }

          // Fetch from API if not in cache
          return this.http.get<LeaguesResponse>(`${this.apiConfig.baseUrl}${this.apiConfig.endpoints.leagues}`).pipe(
            map(response => response.leagues || []),
            switchMap(leagues => {
              // Cache leagues with configurable TTL
              return this.cacheService.set('leagues', 'all-leagues', leagues).pipe(
                map(() => leagues)
              );
            }),
            catchError((err: HttpErrorResponse) => {
              console.error('Failed to fetch leagues:', err);
              this.leaguesCache$ = null;
              return of([]);
            })
          );
        }),
        shareReplay(1)
      );
    }
    return this.leaguesCache$;
  }

  getSeasonBadge(leagueId: string): Observable<string | null> {
    if (!this.badgeCache.has(leagueId)) {
      const badge$ = this.cacheService.get<string>('badges', leagueId).pipe(
        switchMap(cachedBadge => {
          if (cachedBadge) {
            return of(cachedBadge);
          }

          // Fetch from API if not in cache
          return this.http.get<SeasonsResponse>(`${this.apiConfig.baseUrl}${this.apiConfig.endpoints.seasons}?badge=1&id=${leagueId}`).pipe(
            map(response => response.seasons?.[0]?.strBadge || null),
            switchMap(badgeUrl => {
              if (badgeUrl) {
                // Cache badges with configurable TTL
                return this.cacheService.set('badges', leagueId, badgeUrl).pipe(
                  map(() => badgeUrl)
                );
              }
              return of(null);
            }),
            catchError((err: HttpErrorResponse) => {
              console.error(`Failed to fetch badge for league ${leagueId}:`, err);
              this.badgeCache.delete(leagueId);
              return of(null);
            })
          );
        }),
        shareReplay(1)
      );
      
      this.badgeCache.set(leagueId, badge$);
    }
    return this.badgeCache.get(leagueId) as Observable<string | null>;
  }

  // Cache management methods
  clearLeaguesCache(): Observable<void> {
    this.leaguesCache$ = null;
    return this.cacheService.clear('leagues');
  }

  clearBadgesCache(): Observable<void> {
    this.badgeCache.clear();
    return this.cacheService.clear('badges');
  }

  clearAllCache(): Observable<void> {
    this.leaguesCache$ = null;
    this.badgeCache.clear();
    return new Observable(subscriber => {
      this.cacheService.clear('leagues').subscribe(() => {
        this.cacheService.clear('badges').subscribe(() => {
          this.cacheService.clear('searchResults').subscribe(() => {
            subscriber.next();
            subscriber.complete();
          });
        });
      });
    });
  }

  getCacheStats(): Observable<{ [storeName: string]: { count: number; size: number } }> {
    return this.cacheService.getStats();
  }

  cleanupExpiredCache(): Observable<number> {
    return this.cacheService.cleanup();
  }
}