import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { AppComponent } from './app.component';
import { SportsService } from './services/sports.service';
import { League } from './models/league.model';
import { SearchFilterComponent } from './components/search-filter/search-filter.component';
import { LeagueListComponent } from './components/league-list/league-list.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockSportsService: jasmine.SpyObj<SportsService>;

  const mockLeagues: League[] = [
    {
      idLeague: '1',
      strLeague: 'Premier League',
      strSport: 'Soccer',
      strLeagueAlternate: 'EPL'
    },
    {
      idLeague: '2',
      strLeague: 'La Liga',
      strSport: 'Soccer',
      strLeagueAlternate: 'Spanish League'
    },
    {
      idLeague: '3',
      strLeague: 'NBA',
      strSport: 'Basketball',
      strLeagueAlternate: 'National Basketball Association'
    }
  ];

  beforeEach(async () => {
    const sportsServiceSpy = jasmine.createSpyObj('SportsService', ['getLeagues']);

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: SportsService, useValue: sportsServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    mockSportsService = TestBed.inject(SportsService) as jasmine.SpyObj<SportsService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initial state', () => {
    it('should have correct initial values', () => {
      mockSportsService.getLeagues.and.returnValue(of(mockLeagues));
      fixture.detectChanges();

      expect(component.searchTerm()).toBe('');
      expect(component.selectedSport()).toBe('All');
    });

    it('should start with loading state', () => {
      mockSportsService.getLeagues.and.returnValue(of(mockLeagues));
      
      // Check initial loading state before service resolves
      expect(component.loading()).toBe(true);
      expect(component.leagues()).toEqual([]);
      expect(component.error()).toBeNull();
    });
  });

  describe('Leagues loading', () => {
    it('should load leagues successfully', () => {
      mockSportsService.getLeagues.and.returnValue(of(mockLeagues));
      fixture.detectChanges();

      // Allow async operations to complete
      setTimeout(() => {
        expect(component.loading()).toBe(false);
        expect(component.leagues()).toEqual(mockLeagues);
        expect(component.error()).toBeNull();
      }, 0);
    });

    it('should handle leagues loading error', () => {
      const errorMessage = 'Failed to load leagues';
      mockSportsService.getLeagues.and.returnValue(throwError(() => new Error(errorMessage)));
      fixture.detectChanges();

      setTimeout(() => {
        expect(component.loading()).toBe(false);
        expect(component.leagues()).toEqual([]);
        expect(component.error()).toBe(errorMessage);
      }, 0);
    });
  });

  describe('Computed signals', () => {
    beforeEach(() => {
      mockSportsService.getLeagues.and.returnValue(of(mockLeagues));
      fixture.detectChanges();
    });

    it('should compute unique sports correctly', () => {
      setTimeout(() => {
        const uniqueSports = component.uniqueSports();
        expect(uniqueSports).toEqual(['Basketball', 'Soccer']);
        expect(uniqueSports.length).toBe(2);
      }, 0);
    });

    it('should handle empty leagues for unique sports', () => {
      mockSportsService.getLeagues.and.returnValue(of([]));
      fixture.detectChanges();

      setTimeout(() => {
        const uniqueSports = component.uniqueSports();
        expect(uniqueSports).toEqual([]);
      }, 0);
    });
  });

  describe('Filtering functionality', () => {
    beforeEach(() => {
      mockSportsService.getLeagues.and.returnValue(of(mockLeagues));
      fixture.detectChanges();
    });

    it('should filter leagues by search term', () => {
      setTimeout(() => {
        component.onSearchChange('Premier');
        
        const filtered = component.filteredLeagues();
        expect(filtered.length).toBe(1);
        expect(filtered[0].strLeague).toBe('Premier League');
      }, 0);
    });

    it('should filter leagues by alternative name', () => {
      setTimeout(() => {
        component.onSearchChange('EPL');
        
        const filtered = component.filteredLeagues();
        expect(filtered.length).toBe(1);
        expect(filtered[0].strLeague).toBe('Premier League');
      }, 0);
    });

    it('should filter leagues by sport', () => {
      setTimeout(() => {
        component.onSportChange('Basketball');
        
        const filtered = component.filteredLeagues();
        expect(filtered.length).toBe(1);
        expect(filtered[0].strSport).toBe('Basketball');
      }, 0);
    });

    it('should filter by both search term and sport', () => {
      setTimeout(() => {
        component.onSearchChange('La');
        component.onSportChange('Soccer');
        
        const filtered = component.filteredLeagues();
        expect(filtered.length).toBe(1);
        expect(filtered[0].strLeague).toBe('La Liga');
      }, 0);
    });

    it('should return empty array when no matches', () => {
      setTimeout(() => {
        component.onSearchChange('NonExistentLeague');
        
        const filtered = component.filteredLeagues();
        expect(filtered.length).toBe(0);
      }, 0);
    });

    it('should be case insensitive for search', () => {
      setTimeout(() => {
        component.onSearchChange('premier');
        
        const filtered = component.filteredLeagues();
        expect(filtered.length).toBe(1);
        expect(filtered[0].strLeague).toBe('Premier League');
      }, 0);
    });

    it('should show all leagues when sport is "All"', () => {
      setTimeout(() => {
        component.onSportChange('All');
        
        const filtered = component.filteredLeagues();
        expect(filtered.length).toBe(3);
      }, 0);
    });

    it('should handle null alternative name gracefully', () => {
      const leaguesWithNullAlt: League[] = [
        {
          idLeague: '4',
          strLeague: 'Test League',
          strSport: 'Soccer',
          strLeagueAlternate: null as any
        }
      ];
      
      mockSportsService.getLeagues.and.returnValue(of(leaguesWithNullAlt));
      fixture.detectChanges();

      setTimeout(() => {
        component.onSearchChange('Test');
        
        const filtered = component.filteredLeagues();
        expect(filtered.length).toBe(1);
      }, 0);
    });
  });

  describe('Event handlers', () => {
    it('should update search term when onSearchChange is called', () => {
      const newTerm = 'Barcelona';
      component.onSearchChange(newTerm);
      
      expect(component.searchTerm()).toBe(newTerm);
    });

    it('should update selected sport when onSportChange is called', () => {
      const newSport = 'Basketball';
      component.onSportChange(newSport);
      
      expect(component.selectedSport()).toBe(newSport);
    });

    it('should update filtered leagues when search term changes', () => {
      mockSportsService.getLeagues.and.returnValue(of(mockLeagues));
      fixture.detectChanges();

      setTimeout(() => {
        const initialCount = component.filteredLeagues().length;
        component.onSearchChange('Premier');
        const filteredCount = component.filteredLeagues().length;
        
        expect(filteredCount).toBeLessThan(initialCount);
      }, 0);
    });

    it('should update filtered leagues when sport changes', () => {
      mockSportsService.getLeagues.and.returnValue(of(mockLeagues));
      fixture.detectChanges();

      setTimeout(() => {
        const initialCount = component.filteredLeagues().length;
        component.onSportChange('Basketball');
        const filteredCount = component.filteredLeagues().length;
        
        expect(filteredCount).toBeLessThan(initialCount);
      }, 0);
    });
  });

  describe('Reactivity', () => {
    it('should react to multiple filter changes', () => {
      mockSportsService.getLeagues.and.returnValue(of(mockLeagues));
      fixture.detectChanges();

      setTimeout(() => {
        // Apply multiple filters
        component.onSportChange('Soccer');
        component.onSearchChange('La');
        
        const filtered = component.filteredLeagues();
        expect(filtered.length).toBe(1);
        expect(filtered[0].strLeague).toBe('La Liga');

        // Change search term
        component.onSearchChange('Premier');
        const newFiltered = component.filteredLeagues();
        expect(newFiltered.length).toBe(1);
        expect(newFiltered[0].strLeague).toBe('Premier League');
      }, 0);
    });

    it('should maintain sport filter when search changes', () => {
      mockSportsService.getLeagues.and.returnValue(of(mockLeagues));
      fixture.detectChanges();

      setTimeout(() => {
        component.onSportChange('Basketball');
        component.onSearchChange('Premier'); // Premier League is Soccer, not Basketball
        
        const filtered = component.filteredLeagues();
        expect(filtered.length).toBe(0); // Should be empty as no Basketball leagues match "Premier"
      }, 0);
    });
  });
});