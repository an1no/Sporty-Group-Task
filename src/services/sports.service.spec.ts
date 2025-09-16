import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { SportsService } from './sports.service';
import { League, LeaguesResponse } from '../models/league.model';
import { Season, SeasonsResponse } from '../models/season.model';
import { of, throwError } from 'rxjs';

describe('SportsService', () => {
  let service: SportsService;
  let httpMock: HttpTestingController;

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
    }
  ];

  const mockLeaguesResponse: LeaguesResponse = {
    leagues: mockLeagues
  };

  const mockSeasonsResponse: SeasonsResponse = {
    seasons: [
      {
        strSeason: '2023-24',
        strBadge: 'https://example.com/badge.png'
      }
    ]
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        SportsService,
        provideHttpClient()
      ]
    });
    service = TestBed.inject(SportsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getLeagues', () => {
    it('should fetch leagues successfully', (done) => {
      service.getLeagues().subscribe((leagues) => {
        expect(leagues).toEqual(mockLeagues);
        expect(leagues.length).toBe(2);
        expect(leagues[0].strLeague).toBe('Premier League');
        done();
      });

      const req = httpMock.expectOne('https://www.thesportsdb.com/api/v1/json/3/all_leagues.php');
      expect(req.request.method).toBe('GET');
      req.flush(mockLeaguesResponse);
    });

    it('should handle empty leagues response', (done) => {
      const emptyResponse = { leagues: null };
      
      service.getLeagues().subscribe((leagues) => {
        expect(leagues).toEqual([]);
        done();
      });

      const req = httpMock.expectOne('https://www.thesportsdb.com/api/v1/json/3/all_leagues.php');
      req.flush(emptyResponse);
    });

    it('should cache leagues and not make multiple HTTP requests', () => {
      // First call
      service.getLeagues().subscribe();
      const req1 = httpMock.expectOne('https://www.thesportsdb.com/api/v1/json/3/all_leagues.php');
      req1.flush(mockLeaguesResponse);

      // Second call - should use cache, no new HTTP request
      service.getLeagues().subscribe();
      httpMock.expectNone('https://www.thesportsdb.com/api/v1/json/3/all_leagues.php');
    });

    it('should handle HTTP errors and reset cache', (done) => {
      service.getLeagues().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.message).toBe('Could not load leagues. Please try again later.');
          done();
        }
      });

      const req = httpMock.expectOne('https://www.thesportsdb.com/api/v1/json/3/all_leagues.php');
      req.error(new ProgressEvent('Network error'));
    });

    it('should retry after error by making new HTTP request', () => {
      // First call fails
      service.getLeagues().subscribe({
        error: () => {}
      });
      const req1 = httpMock.expectOne('https://www.thesportsdb.com/api/v1/json/3/all_leagues.php');
      req1.error(new ProgressEvent('Network error'));

      // Second call should make new HTTP request (cache was reset)
      service.getLeagues().subscribe();
      const req2 = httpMock.expectOne('https://www.thesportsdb.com/api/v1/json/3/all_leagues.php');
      req2.flush(mockLeaguesResponse);
    });
  });

  describe('getSeasonBadge', () => {
    const leagueId = '123';
    const expectedUrl = `https://www.thesportsdb.com/api/v1/json/3/search_all_seasons.php?badge=1&id=${leagueId}`;

    it('should fetch season badge successfully', (done) => {
      service.getSeasonBadge(leagueId).subscribe((badgeUrl) => {
        expect(badgeUrl).toBe('https://example.com/badge.png');
        done();
      });

      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockSeasonsResponse);
    });

    it('should return null when no seasons are found', (done) => {
      const emptyResponse = { seasons: null };
      
      service.getSeasonBadge(leagueId).subscribe((badgeUrl) => {
        expect(badgeUrl).toBeNull();
        done();
      });

      const req = httpMock.expectOne(expectedUrl);
      req.flush(emptyResponse);
    });

    it('should return null when seasons array is empty', (done) => {
      const emptyResponse = { seasons: [] };
      
      service.getSeasonBadge(leagueId).subscribe((badgeUrl) => {
        expect(badgeUrl).toBeNull();
        done();
      });

      const req = httpMock.expectOne(expectedUrl);
      req.flush(emptyResponse);
    });

    it('should cache badge requests and not make duplicate HTTP calls', () => {
      // First call
      service.getSeasonBadge(leagueId).subscribe();
      const req1 = httpMock.expectOne(expectedUrl);
      req1.flush(mockSeasonsResponse);

      // Second call for same league - should use cache
      service.getSeasonBadge(leagueId).subscribe();
      httpMock.expectNone(expectedUrl);
    });

    it('should handle different league IDs separately', () => {
      const leagueId2 = '456';
      const expectedUrl2 = `https://www.thesportsdb.com/api/v1/json/3/search_all_seasons.php?badge=1&id=${leagueId2}`;

      // First league
      service.getSeasonBadge(leagueId).subscribe();
      const req1 = httpMock.expectOne(expectedUrl);
      req1.flush(mockSeasonsResponse);

      // Different league - should make new HTTP request
      service.getSeasonBadge(leagueId2).subscribe();
      const req2 = httpMock.expectOne(expectedUrl2);
      req2.flush(mockSeasonsResponse);
    });

    it('should handle HTTP errors and return null', (done) => {
      service.getSeasonBadge(leagueId).subscribe((badgeUrl) => {
        expect(badgeUrl).toBeNull();
        done();
      });

      const req = httpMock.expectOne(expectedUrl);
      req.error(new ProgressEvent('Network error'));
    });

    it('should remove from cache on error and allow retry', () => {
      // First call fails
      service.getSeasonBadge(leagueId).subscribe();
      const req1 = httpMock.expectOne(expectedUrl);
      req1.error(new ProgressEvent('Network error'));

      // Second call should make new HTTP request (cache was cleared)
      service.getSeasonBadge(leagueId).subscribe();
      const req2 = httpMock.expectOne(expectedUrl);
      req2.flush(mockSeasonsResponse);
    });
  });
});