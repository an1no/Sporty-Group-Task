import { Component, ChangeDetectionStrategy, input, signal, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { of, switchMap, map, startWith } from 'rxjs';
import { League } from '../../models/league.model';
import { SportsService } from '../../services/sports.service';

@Component({
  selector: 'app-league-list',
  templateUrl: './league-list.component.html',
  imports: [NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeagueListComponent {
  leagues = input.required<League[]>();
  
  private sportsService = inject(SportsService);

  selectedLeagueId = signal<string | null>(null);

  badgeResource = toSignal(
    toObservable(this.selectedLeagueId).pipe(
      switchMap(id => {
        if (!id) {
          return of({ state: 'idle' as const });
        }
        return this.sportsService.getSeasonBadge(id).pipe(
          map(badgeUrl => ({ state: 'loaded' as const, badgeUrl })),
          startWith({ state: 'loading' as const })
        );
      })
    ),
    { initialValue: { state: 'idle' as const } }
  );

  selectLeague(id: string): void {
    if (this.selectedLeagueId() === id) {
      this.selectedLeagueId.set(null);
    } else {
      this.selectedLeagueId.set(id);
    }
  }
}