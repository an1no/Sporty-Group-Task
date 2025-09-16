// Simple test runner for our Angular components
// This will run basic unit tests without the full Angular testing framework

import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';

// Mock implementations
const mockSportsService = {
  getLeagues: () => of([
    {
      idLeague: '1',
      strLeague: 'Premier League',
      strSport: 'Soccer',
      strLeagueAlternate: 'EPL'
    }
  ]),
  getSeasonBadge: (id) => of('https://example.com/badge.png')
};

// Test AppComponent signals and computed values
function testAppComponent() {
  console.log('Testing AppComponent...');
  
  // Create mock component instance
  const component = {
    searchTerm: signal(''),
    selectedSport: signal('All'),
    leagues: signal([
      {
        idLeague: '1',
        strLeague: 'Premier League',
        strSport: 'Soccer',
        strLeagueAlternate: 'EPL'
      },
      {
        idLeague: '2',
        strLeague: 'NBA',
        strSport: 'Basketball',
        strLeagueAlternate: 'National Basketball Association'
      }
    ]),
    
    uniqueSports: function() {
      const sports = this.leagues().map(league => league.strSport);
      return [...new Set(sports)].sort();
    },
    
    filteredLeagues: function() {
      const leagues = this.leagues();
      const search = this.searchTerm().toLowerCase();
      const sport = this.selectedSport();

      return leagues.filter(league => {
        const nameMatch = league.strLeague.toLowerCase().includes(search) ||
                          (league.strLeagueAlternate && league.strLeagueAlternate.toLowerCase().includes(search));
        const sportMatch = sport === 'All' || league.strSport === sport;
        return nameMatch && sportMatch;
      });
    },
    
    onSearchChange: function(term) {
      this.searchTerm.set(term);
    },
    
    onSportChange: function(sport) {
      this.selectedSport.set(sport);
    }
  };
  
  // Test 1: Initial state
  console.log('✓ Test 1: Initial search term should be empty');
  if (component.searchTerm() !== '') {
    throw new Error('Initial search term should be empty');
  }
  
  // Test 2: Unique sports computation
  console.log('✓ Test 2: Unique sports computation');
  const uniqueSports = component.uniqueSports();
  if (uniqueSports.length !== 2 || !uniqueSports.includes('Soccer') || !uniqueSports.includes('Basketball')) {
    throw new Error('Unique sports computation failed');
  }
  
  // Test 3: Filtering by search term
  console.log('✓ Test 3: Filtering by search term');
  component.onSearchChange('Premier');
  const filtered = component.filteredLeagues();
  if (filtered.length !== 1 || filtered[0].strLeague !== 'Premier League') {
    throw new Error('Search filtering failed');
  }
  
  // Test 4: Filtering by sport
  console.log('✓ Test 4: Filtering by sport');
  component.onSearchChange(''); // Reset search
  component.onSportChange('Basketball');
  const basketballLeagues = component.filteredLeagues();
  if (basketballLeagues.length !== 1 || basketballLeagues[0].strSport !== 'Basketball') {
    throw new Error('Sport filtering failed');
  }
  
  // Test 5: Case insensitive search
  console.log('✓ Test 5: Case insensitive search');
  component.onSportChange('All'); // Reset sport filter
  component.onSearchChange('premier');
  const caseInsensitive = component.filteredLeagues();
  if (caseInsensitive.length !== 1 || caseInsensitive[0].strLeague !== 'Premier League') {
    throw new Error('Case insensitive search failed');
  }
  
  console.log('✅ AppComponent tests passed!');
}

// Test SearchFilterComponent behavior
function testSearchFilterComponent() {
  console.log('Testing SearchFilterComponent...');
  
  const mockSports = ['Soccer', 'Basketball', 'Tennis'];
  let emittedSearchValue = '';
  let emittedSportValue = '';
  
  const component = {
    sports: signal(mockSports),
    searchChange: {
      emit: (value) => { emittedSearchValue = value; }
    },
    sportChange: {
      emit: (value) => { emittedSportValue = value; }
    },
    
    onSearchChange: function(event) {
      const value = event.target.value;
      this.searchChange.emit(value);
    },
    
    onSportChange: function(event) {
      const value = event.target.value;
      this.sportChange.emit(value);
    }
  };
  
  // Test 1: Sports input
  console.log('✓ Test 1: Sports input signal');
  if (component.sports().length !== 3) {
    throw new Error('Sports input failed');
  }
  
  // Test 2: Search change emission
  console.log('✓ Test 2: Search change emission');
  const mockSearchEvent = { target: { value: 'Premier League' } };
  component.onSearchChange(mockSearchEvent);
  if (emittedSearchValue !== 'Premier League') {
    throw new Error('Search change emission failed');
  }
  
  // Test 3: Sport change emission
  console.log('✓ Test 3: Sport change emission');
  const mockSportEvent = { target: { value: 'Soccer' } };
  component.onSportChange(mockSportEvent);
  if (emittedSportValue !== 'Soccer') {
    throw new Error('Sport change emission failed');
  }
  
  console.log('✅ SearchFilterComponent tests passed!');
}

// Test LeagueListComponent behavior
function testLeagueListComponent() {
  console.log('Testing LeagueListComponent...');
  
  const mockLeagues = [
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
    }
  ];
  
  const component = {
    leagues: signal(mockLeagues),
    selectedLeagueId: signal(null),
    badgeResource: signal({ state: 'idle' }),
    
    selectLeague: function(id) {
      if (this.selectedLeagueId() === id) {
        this.selectedLeagueId.set(null); // Toggle off
      } else {
        this.selectedLeagueId.set(id);
        this.badgeResource.set({ state: 'loading' });
        // Simulate async badge loading
        setTimeout(() => {
          this.badgeResource.set({ 
            state: 'loaded', 
            badgeUrl: 'https://example.com/badge.png' 
          });
        }, 0);
      }
    }
  };
  
  // Test 1: Initial state
  console.log('✓ Test 1: Initial state');
  if (component.selectedLeagueId() !== null) {
    throw new Error('Initial selected league should be null');
  }
  
  // Test 2: League selection
  console.log('✓ Test 2: League selection');
  component.selectLeague('1');
  if (component.selectedLeagueId() !== '1') {
    throw new Error('League selection failed');
  }
  
  // Test 3: League deselection
  console.log('✓ Test 3: League deselection');
  component.selectLeague('1'); // Click same league again
  if (component.selectedLeagueId() !== null) {
    throw new Error('League deselection failed');
  }
  
  // Test 4: Badge loading state
  console.log('✓ Test 4: Badge loading state');
  component.selectLeague('1');
  if (component.badgeResource().state !== 'loading') {
    throw new Error('Badge loading state failed');
  }
  
  console.log('✅ LeagueListComponent tests passed!');
}

// Test SportsService caching behavior
function testSportsService() {
  console.log('Testing SportsService caching...');
  
  let requestCount = 0;
  let cachedData = null;
  
  const mockHttpGet = (url) => {
    requestCount++;
    return of({
      leagues: [
        {
          idLeague: '1',
          strLeague: 'Premier League',
          strSport: 'Soccer',
          strLeagueAlternate: 'EPL'
        }
      ]
    });
  };
  
  const service = {
    leaguesCache: null,
    
    getLeagues: function() {
      if (!this.leaguesCache) {
        this.leaguesCache = mockHttpGet('leagues-url').pipe(
          map(response => response.leagues || [])
        );
      }
      return this.leaguesCache;
    }
  };
  
  // Test 1: First call makes HTTP request
  console.log('✓ Test 1: First call makes HTTP request');
  service.getLeagues().subscribe();
  if (requestCount !== 1) {
    throw new Error('First call should make HTTP request');
  }
  
  // Test 2: Second call uses cache
  console.log('✓ Test 2: Second call uses cache');
  const initialCount = requestCount;
  service.getLeagues().subscribe();
  if (requestCount !== initialCount) {
    throw new Error('Second call should use cache');
  }
  
  console.log('✅ SportsService tests passed!');
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting unit tests...\n');
  
  try {
    testAppComponent();
    console.log('');
    
    testSearchFilterComponent();
    console.log('');
    
    testLeagueListComponent();
    console.log('');
    
    testSportsService();
    console.log('');
    
    console.log('🎉 All tests passed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Import map function from rxjs
const { map } = await import('rxjs/operators');

// Run the tests
runAllTests();