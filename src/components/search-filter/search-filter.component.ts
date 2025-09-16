import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-filter',
  templateUrl: './search-filter.component.html',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchFilterComponent {
  sports = input.required<string[]>();
  searchChange = output<string>();
  sportChange = output<string>();

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchChange.emit(value);
  }

  onSportChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.sportChange.emit(value);
  }
}
