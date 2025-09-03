import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

export interface FilterOptions {
  search: string;
  type: string;
  region: string;
  generation: string;
}

@Component({
  selector: 'app-pokemon-filter',
  imports: [FormsModule, TranslateModule],
  templateUrl: './pokemon-filter.html',
})
export class PokemonFilter {
  @Input() totalCount = 0;
  @Input() filteredCount = 0;
  @Input() isLoading = false;
  @Output() filterChange = new EventEmitter<FilterOptions>();
  @Output() clearFilters = new EventEmitter<void>();

  // Estados del filtro
  search = '';
  selectedType = '';
  selectedRegion = '';
  selectedGeneration = '';

  // Opciones disponibles
  pokemonTypes = [
    'normal',
    'fighting',
    'flying',
    'poison',
    'ground',
    'rock',
    'bug',
    'ghost',
    'steel',
    'fire',
    'water',
    'grass',
    'electric',
    'psychic',
    'ice',
    'dragon',
    'dark',
    'fairy',
  ];

  pokemonRegions = ['kanto', 'johto', 'hoenn', 'sinnoh', 'unova', 'kalos', 'alola', 'galar'];

  pokemonGenerations = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

  onSearchChange(): void {
    this.emitFilterChange();
  }

  onTypeChange(): void {
    this.emitFilterChange();
  }

  onRegionChange(): void {
    this.emitFilterChange();
  }

  onGenerationChange(): void {
    this.emitFilterChange();
  }

  onClearFilters(): void {
    this.search = '';
    this.selectedType = '';
    this.selectedRegion = '';
    this.selectedGeneration = '';
    this.clearFilters.emit();
  }

  public emitFilterChange(): void {
    this.filterChange.emit({
      search: this.search.trim(),
      type: this.selectedType,
      region: this.selectedRegion,
      generation: this.selectedGeneration,
    });
  }

  get hasActiveFilters(): boolean {
    return !!(
      this.search.trim() ||
      this.selectedType ||
      this.selectedRegion ||
      this.selectedGeneration
    );
  }
}
