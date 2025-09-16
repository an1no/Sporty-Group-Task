import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { SportsService } from './services/sports.service';
import { League } from './models/league.model';
import { SearchFilterComponent } from './components/search-filter/search-filter.component';
import { LeagueListComponent } from './components/league-list/league-list.component';

interface LeaguesState {
  leagues: League[];
  loading: boolean;
  error: string | null;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [CommonModule, SearchFilterComponent, LeagueListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private sportsService = inject(SportsService);

  private leaguesState = toSignal(this.sportsService.getLeagues().pipe(
    map((leagues): LeaguesState => ({ leagues, loading: false, error: null })),
    catchError((error: Error) => of({ leagues: [], loading: false, error: error.message }))
  ), {
    initialValue: { leagues: [], loading: true, error: null }
  });

  leagues = computed(() => this.leaguesState().leagues);
  loading = computed(() => this.leaguesState().loading);
  error = computed(() => this.leaguesState().error);
  
  searchTerm = signal('');
  selectedSport = signal('All');

  uniqueSports = computed(() => {
    const sports = this.leagues().map(league => league.strSport);
    return [...new Set(sports)].sort();
  });

  filteredLeagues = computed(() => {
    const leagues = this.leagues();
    const search = this.searchTerm().toLowerCase();
    const sport = this.selectedSport();

    return leagues.filter(league => {
      const nameMatch = league.strLeague.toLowerCase().includes(search) ||
                        (league.strLeagueAlternate && league.strLeagueAlternate.toLowerCase().includes(search));
      const sportMatch = sport === 'All' || league.strSport === sport;
      return nameMatch && sportMatch;
    });
  });

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
  }

  onSportChange(sport: string): void {
    this.selectedSport.set(sport);
  }
}
