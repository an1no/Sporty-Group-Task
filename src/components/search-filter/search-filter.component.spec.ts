import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { signal } from '@angular/core';
import { SearchFilterComponent } from './search-filter.component';

describe('SearchFilterComponent', () => {
  let component: SearchFilterComponent;
  let fixture: ComponentFixture<SearchFilterComponent>;

  const mockSports = ['Soccer', 'Basketball', 'Tennis'];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchFilterComponent, FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchFilterComponent);
    component = fixture.componentInstance;
    
    // Set required input
    fixture.componentRef.setInput('sports', signal(mockSports));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Template rendering', () => {
    it('should render search input', () => {
      const searchInput = fixture.debugElement.query(By.css('input[type="text"]'));
      expect(searchInput).toBeTruthy();
      expect(searchInput.nativeElement.placeholder).toBe('Search league by name...');
    });

    it('should render sport select dropdown', () => {
      const selectElement = fixture.debugElement.query(By.css('select'));
      expect(selectElement).toBeTruthy();
    });

    it('should render "All Sports" as first option', () => {
      const options = fixture.debugElement.queryAll(By.css('option'));
      expect(options[0].nativeElement.textContent.trim()).toBe('All Sports');
      expect(options[0].nativeElement.value).toBe('All');
    });

    it('should render all sports as options', () => {
      const options = fixture.debugElement.queryAll(By.css('option'));
      
      // Should have "All Sports" + all provided sports
      expect(options.length).toBe(mockSports.length + 1);
      
      // Check each sport option
      mockSports.forEach((sport, index) => {
        const optionIndex = index + 1; // +1 because "All Sports" is first
        expect(options[optionIndex].nativeElement.textContent.trim()).toBe(sport);
        expect(options[optionIndex].nativeElement.value).toBe(sport);
      });
    });

    it('should render search icon', () => {
      const searchIcon = fixture.debugElement.query(By.css('svg path[d*="21-5.197"]'));
      expect(searchIcon).toBeTruthy();
    });

    it('should render dropdown arrow icon', () => {
      const dropdownIcon = fixture.debugElement.query(By.css('svg path[d*="M19 9l-7 7-7-7"]'));
      expect(dropdownIcon).toBeTruthy();
    });
  });

  describe('Search input functionality', () => {
    it('should emit search change when input value changes', () => {
      spyOn(component.searchChange, 'emit');
      
      const searchInput = fixture.debugElement.query(By.css('input[type="text"]'));
      const inputElement = searchInput.nativeElement;
      
      inputElement.value = 'Premier League';
      inputElement.dispatchEvent(new Event('input'));
      
      expect(component.searchChange.emit).toHaveBeenCalledWith('Premier League');
    });

    it('should emit empty string when input is cleared', () => {
      spyOn(component.searchChange, 'emit');
      
      const searchInput = fixture.debugElement.query(By.css('input[type="text"]'));
      const inputElement = searchInput.nativeElement;
      
      inputElement.value = '';
      inputElement.dispatchEvent(new Event('input'));
      
      expect(component.searchChange.emit).toHaveBeenCalledWith('');
    });

    it('should call onSearchChange method when input changes', () => {
      spyOn(component, 'onSearchChange').and.callThrough();
      
      const searchInput = fixture.debugElement.query(By.css('input[type="text"]'));
      const inputElement = searchInput.nativeElement;
      
      inputElement.value = 'test search';
      inputElement.dispatchEvent(new Event('input'));
      
      expect(component.onSearchChange).toHaveBeenCalled();
    });

    it('should handle special characters in search input', () => {
      spyOn(component.searchChange, 'emit');
      
      const searchInput = fixture.debugElement.query(By.css('input[type="text"]'));
      const inputElement = searchInput.nativeElement;
      
      const specialText = 'Real Madrid & Barcelona!';
      inputElement.value = specialText;
      inputElement.dispatchEvent(new Event('input'));
      
      expect(component.searchChange.emit).toHaveBeenCalledWith(specialText);
    });
  });

  describe('Sport select functionality', () => {
    it('should emit sport change when select value changes', () => {
      spyOn(component.sportChange, 'emit');
      
      const selectElement = fixture.debugElement.query(By.css('select'));
      const selectNativeElement = selectElement.nativeElement;
      
      selectNativeElement.value = 'Soccer';
      selectNativeElement.dispatchEvent(new Event('change'));
      
      expect(component.sportChange.emit).toHaveBeenCalledWith('Soccer');
    });

    it('should emit "All" when All Sports option is selected', () => {
      spyOn(component.sportChange, 'emit');
      
      const selectElement = fixture.debugElement.query(By.css('select'));
      const selectNativeElement = selectElement.nativeElement;
      
      selectNativeElement.value = 'All';
      selectNativeElement.dispatchEvent(new Event('change'));
      
      expect(component.sportChange.emit).toHaveBeenCalledWith('All');
    });

    it('should call onSportChange method when select changes', () => {
      spyOn(component, 'onSportChange').and.callThrough();
      
      const selectElement = fixture.debugElement.query(By.css('select'));
      const selectNativeElement = selectElement.nativeElement;
      
      selectNativeElement.value = 'Basketball';
      selectNativeElement.dispatchEvent(new Event('change'));
      
      expect(component.onSportChange).toHaveBeenCalled();
    });

    it('should handle sport selection for each available sport', () => {
      spyOn(component.sportChange, 'emit');
      
      const selectElement = fixture.debugElement.query(By.css('select'));
      const selectNativeElement = selectElement.nativeElement;
      
      mockSports.forEach(sport => {
        selectNativeElement.value = sport;
        selectNativeElement.dispatchEvent(new Event('change'));
        
        expect(component.sportChange.emit).toHaveBeenCalledWith(sport);
      });
    });
  });

  describe('Input properties', () => {
    it('should accept sports input signal', () => {
      expect(component.sports()).toEqual(mockSports);
    });

    it('should update when sports input changes', () => {
      const newSports = ['Football', 'Hockey'];
      fixture.componentRef.setInput('sports', signal(newSports));
      fixture.detectChanges();
      
      expect(component.sports()).toEqual(newSports);
      
      const options = fixture.debugElement.queryAll(By.css('option'));
      expect(options.length).toBe(newSports.length + 1); // +1 for "All Sports"
    });

    it('should handle empty sports array', () => {
      fixture.componentRef.setInput('sports', signal([]));
      fixture.detectChanges();
      
      const options = fixture.debugElement.queryAll(By.css('option'));
      expect(options.length).toBe(1); // Only "All Sports" option
      expect(options[0].nativeElement.textContent.trim()).toBe('All Sports');
    });
  });

  describe('Output events', () => {
    it('should have searchChange output defined', () => {
      expect(component.searchChange).toBeDefined();
    });

    it('should have sportChange output defined', () => {
      expect(component.sportChange).toBeDefined();
    });

    it('should emit events with correct types', () => {
      let searchValue: string = '';
      let sportValue: string = '';
      
      component.searchChange.subscribe(value => searchValue = value);
      component.sportChange.subscribe(value => sportValue = value);
      
      // Test search emission
      const searchInput = fixture.debugElement.query(By.css('input[type="text"]'));
      searchInput.nativeElement.value = 'test search';
      searchInput.nativeElement.dispatchEvent(new Event('input'));
      
      expect(searchValue).toBe('test search');
      
      // Test sport emission
      const selectElement = fixture.debugElement.query(By.css('select'));
      selectElement.nativeElement.value = 'Soccer';
      selectElement.nativeElement.dispatchEvent(new Event('change'));
      
      expect(sportValue).toBe('Soccer');
    });
  });

  describe('Event handler methods', () => {
    it('should extract value from input event correctly', () => {
      const mockEvent = {
        target: { value: 'test value' }
      } as any;
      
      spyOn(component.searchChange, 'emit');
      component.onSearchChange(mockEvent);
      
      expect(component.searchChange.emit).toHaveBeenCalledWith('test value');
    });

    it('should extract value from select event correctly', () => {
      const mockEvent = {
        target: { value: 'Basketball' }
      } as any;
      
      spyOn(component.sportChange, 'emit');
      component.onSportChange(mockEvent);
      
      expect(component.sportChange.emit).toHaveBeenCalledWith('Basketball');
    });

    it('should handle null or undefined event targets gracefully', () => {
      const mockEvent = {
        target: null
      } as any;
      
      expect(() => component.onSearchChange(mockEvent)).toThrow();
      expect(() => component.onSportChange(mockEvent)).toThrow();
    });
  });

  describe('CSS classes and styling', () => {
    it('should have correct CSS classes on search input', () => {
      const searchInput = fixture.debugElement.query(By.css('input[type="text"]'));
      const classes = searchInput.nativeElement.className;
      
      expect(classes).toContain('w-full');
      expect(classes).toContain('pl-10');
      expect(classes).toContain('bg-gray-800');
      expect(classes).toContain('border-gray-700');
    });

    it('should have correct CSS classes on select element', () => {
      const selectElement = fixture.debugElement.query(By.css('select'));
      const classes = selectElement.nativeElement.className;
      
      expect(classes).toContain('w-full');
      expect(classes).toContain('bg-gray-800');
      expect(classes).toContain('appearance-none');
    });

    it('should have responsive layout classes', () => {
      const containerDiv = fixture.debugElement.query(By.css('.flex'));
      const classes = containerDiv.nativeElement.className;
      
      expect(classes).toContain('flex-col');
      expect(classes).toContain('md:flex-row');
    });
  });
});