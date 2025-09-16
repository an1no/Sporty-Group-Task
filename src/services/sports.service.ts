import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';
import { League, LeaguesResponse } from '../models/league.model';
import { SeasonsResponse } from '../models/season.model';
import { getApiConfig } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class SportsService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = getApiConfig();

  private leaguesCache$: Observable<League[]> | null = null;
  private readonly badgeCache = new Map<string, Observable<string | null>>();

  getLeagues(): Observable<League[]> {
    if (!this.leaguesCache$) {
      this.leaguesCache$ = this.http.get<LeaguesResponse>(`${this.apiConfig.baseUrl}${this.apiConfig.endpoints.leagues}`).pipe(
        map(response => response.leagues || []),
        shareReplay(1),
        catchError((err: HttpErrorResponse) => {
          console.error('Failed to fetch leagues:', err);
          this.leaguesCache$ = null;
          return of([]); 
        })
      );
    }
    return this.leaguesCache$;
  }

  getSeasonBadge(leagueId: string): Observable<string | null> {
    if (!this.badgeCache.has(leagueId)) {
      const badge$ = this.http.get<SeasonsResponse>(`${this.apiConfig.baseUrl}${this.apiConfig.endpoints.seasons}?badge=1&id=${leagueId}`).pipe(
        map(response => response.seasons?.[0]?.strBadge || null),
        shareReplay(1),
        catchError((err: HttpErrorResponse) => {
          console.error(`Failed to fetch badge for league ${leagueId}:`, err);
          this.badgeCache.delete(leagueId);
          return of(null);
        })
      );
      this.badgeCache.set(leagueId, badge$);
    }
    return this.badgeCache.get(leagueId) as Observable<string | null>;
  }
}