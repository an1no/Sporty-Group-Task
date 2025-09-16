import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgOptimizedImage } from '@angular/common';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { LeagueListComponent } from './league-list.component';
import { SportsService } from '../../services/sports.service';
import { League } from '../../models/league.model';

describe('LeagueListComponent', () => {
  let component: LeagueListComponent;
  let fixture: ComponentFixture<LeagueListComponent>;
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
      strLeagueAlternate: ''
    }
  ];

  beforeEach(async () => {
    const sportsServiceSpy = jasmine.createSpyObj('SportsService', ['getSeasonBadge']);

    await TestBed.configureTestingModule({
      imports: [LeagueListComponent, NgOptimizedImage],
      providers: [
        { provide: SportsService, useValue: sportsServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LeagueListComponent);
    component = fixture.componentInstance;
    mockSportsService = TestBed.inject(SportsService) as jasmine.SpyObj<SportsService>;
    
    // Set required input
    fixture.componentRef.setInput('leagues', signal(mockLeagues));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initial state', () => {
    it('should start with no league selected', () => {
      expect(component.selectedLeagueId()).toBeNull();
    });

    it('should have badge resource in idle state initially', () => {
      expect(component.badgeResource().state).toBe('idle');
    });
  });

  describe('Template rendering', () => {
    it('should render all leagues', () => {
      const leagueCards = fixture.debugElement.queryAll(By.css('[data-testid="league-card"], .bg-gray-800.rounded-lg'));
      expect(leagueCards.length).toBe(mockLeagues.length);
    });

    it('should display league names', () => {
      const leagueNames = fixture.debugElement.queryAll(By.css('h3'));
      
      expect(leagueNames.length).toBe(mockLeagues.length);
      expect(leagueNames[0].nativeElement.textContent.trim()).toBe('Premier League');
      expect(leagueNames[1].nativeElement.textContent.trim()).toBe('La Liga');
      expect(leagueNames[2].nativeElement.textContent.trim()).toBe('NBA');
    });

    it('should display league sports', () => {
      const sportTexts = fixture.debugElement.queryAll(By.css('p.text-sm.text-gray-400'));
      
      expect(sportTexts.length).toBe(mockLeagues.length);
      expect(sportTexts[0].nativeElement.textContent.trim()).toBe('Soccer');
      expect(sportTexts[1].nativeElement.textContent.trim()).toBe('Soccer');
      expect(sportTexts[2].nativeElement.textContent.trim()).toBe('Basketball');
    });

    it('should display alternative names when present', () => {
      const alternativeNames = fixture.debugElement.queryAll(By.css('p.text-xs.text-gray-500'));
      
      // Only leagues with alternative names should be displayed
      expect(alternativeNames.length).toBe(2); // Premier League and La Liga have alternatives
      expect(alternativeNames[0].nativeElement.textContent.trim()).toBe('EPL');
      expect(alternativeNames[1].nativeElement.textContent.trim()).toBe('Spanish League');
    });

    it('should not display alternative name when null', () => {
      // NBA has null alternative name, so it shouldn't be rendered
      const allAlternatives = fixture.debugElement.queryAll(By.css('p.text-xs.text-gray-500'));
      const nbaAlternative = allAlternatives.find(el => 
        el.nativeElement.textContent.includes('National Basketball Association')
      );
      expect(nbaAlternative).toBeFalsy();
    });

    it('should have correct title attributes for truncated text', () => {
      const leagueNames = fixture.debugElement.queryAll(By.css('h3'));
      expect(leagueNames[0].nativeElement.title).toBe('Premier League');
      expect(leagueNames[1].nativeElement.title).toBe('La Liga');
    });
  });

  describe('League selection', () => {
    it('should select league when clicked', () => {
      const firstLeagueCard = fixture.debugElement.queryAll(By.css('.bg-gray-800.rounded-lg'))[0];
      
      firstLeagueCard.nativeElement.click();
      
      expect(component.selectedLeagueId()).toBe('1');
    });

    it('should deselect league when clicked again', () => {
      component.selectLeague('1');
      expect(component.selectedLeagueId()).toBe('1');
      
      component.selectLeague('1');
      expect(component.selectedLeagueId()).toBeNull();
    });

    it('should switch selection between leagues', () => {
      component.selectLeague('1');
      expect(component.selectedLeagueId()).toBe('1');
      
      component.selectLeague('2');
      expect(component.selectedLeagueId()).toBe('2');
    });

    it('should add ring styling to selected league', () => {
      component.selectLeague('1');
      fixture.detectChanges();
      
      const selectedCard = fixture.debugElement.queryAll(By.css('.ring-2'))[0];
      expect(selectedCard).toBeTruthy();
      expect(selectedCard.classes['ring-red-500']).toBeTruthy();
    });

    it('should only have one league selected at a time', () => {
      component.selectLeague('1');
      fixture.detectChanges();
      
      let selectedCards = fixture.debugElement.queryAll(By.css('.ring-2'));
      expect(selectedCards.length).toBe(1);
      
      component.selectLeague('2');
      fixture.detectChanges();
      
      selectedCards = fixture.debugElement.queryAll(By.css('.ring-2'));
      expect(selectedCards.length).toBe(1);
    });
  });

  describe('Badge loading', () => {
    it('should request badge when league is selected', () => {
      mockSportsService.getSeasonBadge.and.returnValue(of('https://example.com/badge.png'));
      
      component.selectLeague('1');
      
      expect(mockSportsService.getSeasonBadge).toHaveBeenCalledWith('1');
    });

    it('should display loading state while fetching badge', () => {
      mockSportsService.getSeasonBadge.and.returnValue(of('https://example.com/badge.png').pipe());
      
      component.selectLeague('1');
      fixture.detectChanges();
      
      const loadingSpinner = fixture.debugElement.query(By.css('.animate-spin'));
      const loadingText = fixture.debugElement.query(By.css('span'));
      
      expect(loadingSpinner).toBeTruthy();
      expect(loadingText?.nativeElement.textContent.trim()).toBe('Fetching badge...');
    });

    it('should display badge when loaded successfully', (done) => {
      const badgeUrl = 'https://example.com/badge.png';
      mockSportsService.getSeasonBadge.and.returnValue(of(badgeUrl));
      
      component.selectLeague('1');
      fixture.detectChanges();
      
      setTimeout(() => {
        fixture.detectChanges();
        const badgeImage = fixture.debugElement.query(By.css('img[alt*="badge"]'));
        
        expect(badgeImage).toBeTruthy();
        expect(badgeImage.nativeElement.src).toContain(badgeUrl);
        expect(badgeImage.nativeElement.alt).toBe('Premier League badge');
        done();
      }, 0);
    });

    it('should display "No badge available" when badge is null', (done) => {
      mockSportsService.getSeasonBadge.and.returnValue(of(null));
      
      component.selectLeague('1');
      fixture.detectChanges();
      
      setTimeout(() => {
        fixture.detectChanges();
        const noBadgeMessage = fixture.debugElement.query(By.css('p'));
        const messageText = noBadgeMessage?.nativeElement.textContent.trim();
        
        expect(messageText).toBe('No badge available for this league.');
        done();
      }, 0);
    });

    it('should not request badge when no league is selected', () => {
      expect(mockSportsService.getSeasonBadge).not.toHaveBeenCalled();
    });

    it('should handle badge loading error gracefully', (done) => {
      mockSportsService.getSeasonBadge.and.returnValue(throwError(() => new Error('Badge not found')));
      
      component.selectLeague('1');
      fixture.detectChanges();
      
      setTimeout(() => {
        fixture.detectChanges();
        // Should handle error gracefully and not crash
        expect(component).toBeTruthy();
        done();
      }, 0);
    });
  });

  describe('Badge resource state management', () => {
    it('should be in idle state when no league is selected', () => {
      expect(component.badgeResource().state).toBe('idle');
    });

    it('should transition through loading to loaded state', (done) => {
      const badgeUrl = 'https://example.com/badge.png';
      mockSportsService.getSeasonBadge.and.returnValue(of(badgeUrl));
      
      component.selectLeague('1');
      
      // Should start with loading state
      expect(component.badgeResource().state).toBe('loading');
      
      setTimeout(() => {
        // Should end with loaded state
        expect(component.badgeResource().state).toBe('loaded');
        expect((component.badgeResource() as any).badgeUrl).toBe(badgeUrl);
        done();
      }, 0);
    });

    it('should return to idle state when league is deselected', () => {
      mockSportsService.getSeasonBadge.and.returnValue(of('https://example.com/badge.png'));
      
      component.selectLeague('1');
      expect(component.badgeResource().state).toBe('loading');
      
      component.selectLeague('1'); // Deselect
      expect(component.badgeResource().state).toBe('idle');
    });
  });

  describe('Input properties', () => {
    it('should accept leagues input signal', () => {
      expect(component.leagues()).toEqual(mockLeagues);
    });

    it('should update when leagues input changes', () => {
      const newLeagues: League[] = [
        {
          idLeague: '4',
          strLeague: 'Serie A',
          strSport: 'Soccer',
          strLeagueAlternate: 'Italian League'
        }
      ];
      
      fixture.componentRef.setInput('leagues', signal(newLeagues));
      fixture.detectChanges();
      
      expect(component.leagues()).toEqual(newLeagues);
      
      const leagueCards = fixture.debugElement.queryAll(By.css('.bg-gray-800.rounded-lg'));
      expect(leagueCards.length).toBe(1);
    });

    it('should handle empty leagues array', () => {
      fixture.componentRef.setInput('leagues', signal([]));
      fixture.detectChanges();
      
      const leagueCards = fixture.debugElement.queryAll(By.css('.bg-gray-800.rounded-lg'));
      expect(leagueCards.length).toBe(0);
    });
  });

  describe('Responsive grid layout', () => {
    it('should have responsive grid classes', () => {
      const gridContainer = fixture.debugElement.query(By.css('.grid'));
      const classes = gridContainer.nativeElement.className;
      
      expect(classes).toContain('grid-cols-1');
      expect(classes).toContain('sm:grid-cols-2');
      expect(classes).toContain('lg:grid-cols-3');
      expect(classes).toContain('xl:grid-cols-4');
    });
  });

  describe('Accessibility', () => {
    it('should have cursor pointer on clickable cards', () => {
      const leagueCards = fixture.debugElement.queryAll(By.css('.cursor-pointer'));
      expect(leagueCards.length).toBe(mockLeagues.length);
    });

    it('should have proper alt text for badge images', (done) => {
      const badgeUrl = 'https://example.com/badge.png';
      mockSportsService.getSeasonBadge.and.returnValue(of(badgeUrl));
      
      component.selectLeague('1');
      fixture.detectChanges();
      
      setTimeout(() => {
        fixture.detectChanges();
        const badgeImage = fixture.debugElement.query(By.css('img[alt*="badge"]'));
        
        expect(badgeImage.nativeElement.alt).toBe('Premier League badge');
        done();
      }, 0);
    });

    it('should have title attributes for truncated text', () => {
      const leagueNames = fixture.debugElement.queryAll(By.css('h3[title]'));
      expect(leagueNames.length).toBe(mockLeagues.length);
      
      leagueNames.forEach((nameEl, index) => {
        expect(nameEl.nativeElement.title).toBe(mockLeagues[index].strLeague);
      });
    });
  });
});