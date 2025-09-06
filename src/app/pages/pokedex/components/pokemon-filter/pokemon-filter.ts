import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { MessageModule } from 'primeng/message';

export interface FilterOptions {
  search: string;
  types: string[];
  regions: string[];
  generations: string[];
}

@Component({
  selector: 'app-pokemon-filter',
  imports: [
    FormsModule,
    TranslateModule,
    InputTextModule,
    SelectModule,
    ButtonModule,
    ChipModule,
    MessageModule,
  ],
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
  selectedTypes: string[] = [];
  selectedRegions: string[] = [];
  selectedGenerations: string[] = [];

  // Estado de error
  errorMessage = '';
  showError = false;

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
    try {
      this.clearError();
      this.emitFilterChange();
    } catch (error) {
      this.showErrorMessage('Error al buscar pokémon');
    }
  }

  onTypeSelectChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    if (value) {
      this.addType(value);
      select.value = ''; // Reset select
    }
  }

  onRegionSelectChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    if (value) {
      this.addRegion(value);
      select.value = ''; // Reset select
    }
  }

  onGenerationSelectChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    if (value) {
      this.addGeneration(value);
      select.value = ''; // Reset select
    }
  }

  addType(type: string): void {
    try {
      if (!type || type.trim() === '') return;

      if (this.selectedTypes.includes(type)) {
        this.showErrorMessage('Este tipo ya está seleccionado');
        return;
      }

      if (this.getTotalFilters() >= 10) {
        this.showErrorMessage('Máximo 10 filtros permitidos');
        return;
      }

      this.selectedTypes.push(type);
      this.clearError();
      this.emitFilterChange();
    } catch (error) {
      this.showErrorMessage('Error al agregar tipo');
    }
  }

  addRegion(region: string): void {
    try {
      if (!region || region.trim() === '') return;

      if (this.selectedRegions.includes(region)) {
        this.showErrorMessage('Esta región ya está seleccionada');
        return;
      }

      if (this.getTotalFilters() >= 10) {
        this.showErrorMessage('Máximo 10 filtros permitidos');
        return;
      }

      this.selectedRegions.push(region);
      this.clearError();
      this.emitFilterChange();
    } catch (error) {
      this.showErrorMessage('Error al agregar región');
    }
  }

  addGeneration(generation: string): void {
    try {
      if (!generation || generation.trim() === '') return;

      if (this.selectedGenerations.includes(generation)) {
        this.showErrorMessage('Esta generación ya está seleccionada');
        return;
      }

      if (this.getTotalFilters() >= 10) {
        this.showErrorMessage('Máximo 10 filtros permitidos');
        return;
      }

      this.selectedGenerations.push(generation);
      this.clearError();
      this.emitFilterChange();
    } catch (error) {
      this.showErrorMessage('Error al agregar generación');
    }
  }

  removeType(type: string): void {
    try {
      this.selectedTypes = this.selectedTypes.filter((t) => t !== type);
      this.clearError();
      this.emitFilterChange();
    } catch (error) {
      this.showErrorMessage('Error al eliminar tipo');
    }
  }

  removeRegion(region: string): void {
    try {
      this.selectedRegions = this.selectedRegions.filter((r) => r !== region);
      this.clearError();
      this.emitFilterChange();
    } catch (error) {
      this.showErrorMessage('Error al eliminar región');
    }
  }

  removeGeneration(generation: string): void {
    try {
      this.selectedGenerations = this.selectedGenerations.filter((g) => g !== generation);
      this.clearError();
      this.emitFilterChange();
    } catch (error) {
      this.showErrorMessage('Error al eliminar generación');
    }
  }

  clearSearch(): void {
    try {
      this.search = '';
      this.clearError();
      this.emitFilterChange();
    } catch (error) {
      this.showErrorMessage('Error al limpiar búsqueda');
    }
  }

  onClearFilters(): void {
    try {
      this.search = '';
      this.selectedTypes = [];
      this.selectedRegions = [];
      this.selectedGenerations = [];
      this.clearError();
      this.clearFilters.emit();
      this.emitFilterChange();
    } catch (error) {
      this.showErrorMessage('Error al limpiar filtros');
    }
  }

  public emitFilterChange(): void {
    this.filterChange.emit({
      search: this.search.trim(),
      types: this.selectedTypes,
      regions: this.selectedRegions,
      generations: this.selectedGenerations,
    });
  }

  // Métodos de manejo de errores
  private showErrorMessage(message: string): void {
    this.errorMessage = message;
    this.showError = true;

    // Auto-ocultar error después de 5 segundos
    setTimeout(() => {
      this.clearError();
    }, 5000);
  }

  private clearError(): void {
    this.errorMessage = '';
    this.showError = false;
  }

  public dismissError(): void {
    this.clearError();
  }

  get hasActiveFilters(): boolean {
    return !!(
      this.search.trim() ||
      this.selectedTypes.length > 0 ||
      this.selectedRegions.length > 0 ||
      this.selectedGenerations.length > 0
    );
  }

  getTotalFilters(): number {
    return (
      this.selectedTypes.length + this.selectedRegions.length + this.selectedGenerations.length
    );
  }

  get availableTypes(): string[] {
    return this.pokemonTypes.filter((type) => !this.selectedTypes.includes(type));
  }

  get availableRegions(): string[] {
    return this.pokemonRegions.filter((region) => !this.selectedRegions.includes(region));
  }

  get availableGenerations(): string[] {
    return this.pokemonGenerations.filter(
      (generation) => !this.selectedGenerations.includes(generation)
    );
  }

  get searchChipLabel(): string {
    return `🔍 "${this.search.trim()}"`;
  }
}
