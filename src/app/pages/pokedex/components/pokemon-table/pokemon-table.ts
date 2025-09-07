import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  Output,
  EventEmitter,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil, debounceTime, firstValueFrom } from 'rxjs';

// PrimeNG
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

// Services
import { PokemonService } from '../../../../services/pokemon.service';

// Types
import { PokeApiPokemonDetail, CapturedPokemon } from '../../../../interfaces/pokemon.interface';
import { FilterOptions } from '../pokemon-filter/pokemon-filter';

// Components
import { PokemonFilter } from '../pokemon-filter/pokemon-filter';

// Utils
import {
  getPokemonTypeColor,
  getPokemonTypeLabel,
  getPokemonStatValue,
  getPokemonLevel,
  generateRandomLevel,
  getPokemonGeneration,
  getPokemonRegion,
} from '../../../../utils/uiUtils';

@Component({
  selector: 'app-pokemon-table',
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    CardModule,
    TableModule,
    ButtonModule,
    CheckboxModule,
    TagModule,
    ProgressSpinnerModule,
    PokemonFilter,
  ],
  templateUrl: './pokemon-table.html',
})
export class PokemonTable implements OnInit, OnDestroy {
  @Output() pokemonAdded = new EventEmitter<CapturedPokemon[]>();

  private readonly destroy$ = new Subject<void>();
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly pokemonService = inject(PokemonService);

  // Estado de datos
  allPokemon: PokeApiPokemonDetail[] = [];
  filteredPokemon: PokeApiPokemonDetail[] = [];
  displayedPokemon: PokeApiPokemonDetail[] = [];
  capturedPokemonIds: Set<number> = new Set();

  // Estado de UI
  isLoading = false;
  isFiltering = false;

  // Selección
  selectedPokemon: PokeApiPokemonDetail[] = [];
  selectAll = false;

  // Filtros y ordenamiento
  activeFilters: FilterOptions = {
    search: '',
    types: [],
    regions: [],
    generations: [],
  };

  sortBy: keyof PokeApiPokemonDetail | 'stats.attack' | 'stats.defense' | 'stats.speed' | 'level' =
    'name';
  sortOrder: 'asc' | 'desc' = 'asc';

  // Paginación
  pageSize = 25;
  currentPage = 1;

  ngOnInit(): void {
    this.loadAllPokemon();
    this.loadCapturedPokemon();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Getters computados
  get totalCount(): number {
    return this.allPokemon.length;
  }

  get filteredCount(): number {
    return this.filteredPokemon.length;
  }

  get hasNoResults(): boolean {
    return !this.isLoading && this.filteredPokemon.length === 0 && this.allPokemon.length > 0;
  }

  get hasActiveFilters(): boolean {
    return (
      this.activeFilters.search !== '' ||
      this.activeFilters.types.length > 0 ||
      this.activeFilters.regions.length > 0 ||
      this.activeFilters.generations.length > 0
    );
  }

  // Carga de datos
  private async loadAllPokemon(): Promise<void> {
    this.isLoading = true;
    this.cdr.markForCheck();

    try {
      console.log('Cargando todos los Pokémon...');

      // Por simplicidad, cargamos Pokémon del 1 al 100 (para optimizar)
      const pokemonPromises: Promise<PokeApiPokemonDetail | null>[] = [];

      for (let i = 1; i <= 100; i++) {
        pokemonPromises.push(
          this.pokemonService.getPokemonDetail(i).catch((error: any) => {
            console.warn(`Error cargando Pokémon ${i}:`, error);
            return null;
          })
        );
      }

      const pokemonResults = await Promise.all(pokemonPromises);

      this.allPokemon = pokemonResults
        .filter((p): p is PokeApiPokemonDetail => p !== null)
        .map(
          (pokemon) =>
            ({
              ...pokemon,
              level: generateRandomLevel(),
            } as PokeApiPokemonDetail & { level: number })
        );

      console.log(`Cargados ${this.allPokemon.length} Pokémon`);
      this.applyFiltersAndSort();
    } catch (error) {
      console.error('Error al cargar Pokémon:', error);
      this.allPokemon = [];
      this.filteredPokemon = [];
      this.displayedPokemon = [];
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  private loadCapturedPokemon(): void {
    this.pokemonService.capturedPokemons$.pipe(takeUntil(this.destroy$)).subscribe((captured) => {
      this.capturedPokemonIds = new Set(captured.map((p) => p.id));
      this.cdr.markForCheck();
    });
  }

  // Métodos auxiliares para generación y región - Movidos a uiUtils.ts

  // Filtrado y ordenamiento
  onFilterChange(filters: FilterOptions): void {
    this.activeFilters = { ...filters };
    this.currentPage = 1;
    this.clearSelection();
    this.applyFiltersAndSort();
  }

  onClearFilters(): void {
    this.activeFilters = {
      search: '',
      types: [],
      regions: [],
      generations: [],
    };
    this.currentPage = 1;
    this.clearSelection();
    this.applyFiltersAndSort();
  }

  onSortChange(event: any): void {
    this.sortBy = event.field;
    this.sortOrder = event.order === 1 ? 'asc' : 'desc';
    this.applyFiltersAndSort();
  }

  private applyFiltersAndSort(): void {
    this.isFiltering = true;
    this.cdr.markForCheck();

    try {
      // Aplicar filtros
      this.filteredPokemon = this.filterPokemon(this.allPokemon, this.activeFilters);

      // Ordenar
      this.filteredPokemon = this.sortPokemon(this.filteredPokemon, this.sortBy, this.sortOrder);

      // Aplicar paginación
      this.applyPagination();
    } finally {
      this.isFiltering = false;
      this.cdr.markForCheck();
    }
  }

  private filterPokemon(
    pokemon: PokeApiPokemonDetail[],
    filters: FilterOptions
  ): PokeApiPokemonDetail[] {
    return pokemon.filter((p) => {
      // Filtro por búsqueda
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(searchTerm);
        const matchesType = p.types?.some((type: any) =>
          type.type.name.toLowerCase().includes(searchTerm)
        );

        if (!matchesName && !matchesType) {
          return false;
        }
      }

      // Filtro por tipos
      if (filters.types.length > 0) {
        const hasMatchingType = p.types?.some((type: any) =>
          filters.types.includes(type.type.name)
        );
        if (!hasMatchingType) {
          return false;
        }
      }

      // Filtro por generaciones - simplificado
      if (filters.generations.length > 0) {
        const generation = getPokemonGeneration(p.id);
        if (!filters.generations.includes(generation)) {
          return false;
        }
      }

      // Filtro por regiones - simplificado
      if (filters.regions.length > 0) {
        const region = getPokemonRegion(p.id);
        if (!filters.regions.includes(region)) {
          return false;
        }
      }

      return true;
    });
  }

  private sortPokemon(
    pokemon: PokeApiPokemonDetail[],
    sortBy: string,
    order: 'asc' | 'desc'
  ): PokeApiPokemonDetail[] {
    const sorted = [...pokemon].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'level':
          aValue = (a as any).level || 0;
          bValue = (b as any).level || 0;
          break;
        case 'stats.attack':
          aValue = a.stats?.find((s) => s.stat.name === 'attack')?.base_stat || 0;
          bValue = b.stats?.find((s) => s.stat.name === 'attack')?.base_stat || 0;
          break;
        case 'stats.defense':
          aValue = a.stats?.find((s) => s.stat.name === 'defense')?.base_stat || 0;
          bValue = b.stats?.find((s) => s.stat.name === 'defense')?.base_stat || 0;
          break;
        case 'stats.speed':
          aValue = a.stats?.find((s) => s.stat.name === 'speed')?.base_stat || 0;
          bValue = b.stats?.find((s) => s.stat.name === 'speed')?.base_stat || 0;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }

  private applyPagination(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedPokemon = this.filteredPokemon.slice(startIndex, endIndex);
  }

  // Métodos de selección
  isSelected(pokemonId: number): boolean {
    return this.selectedPokemon.some((p) => p.id === pokemonId);
  }

  isPokemonCaptured(pokemonId: number): boolean {
    return this.capturedPokemonIds.has(pokemonId);
  }

  onRowSelect(pokemon: PokeApiPokemonDetail, event: any): void {
    if (event.checked) {
      if (!this.isSelected(pokemon.id)) {
        this.selectedPokemon.push(pokemon);
      }
    } else {
      this.selectedPokemon = this.selectedPokemon.filter((p) => p.id !== pokemon.id);
    }
    this.updateSelectAllState();
  }

  onSelectAllChange(event: any): void {
    if (event.checked) {
      // Seleccionar todos los Pokémon disponibles (no capturados)
      const availablePokemon = this.displayedPokemon.filter((p) => !this.isPokemonCaptured(p.id));
      this.selectedPokemon = [...availablePokemon];
    } else {
      // Deseleccionar todos
      this.selectedPokemon = [];
    }
    this.selectAll = event.checked;
  }

  private updateSelectAllState(): void {
    const availablePokemon = this.displayedPokemon.filter((p) => !this.isPokemonCaptured(p.id));
    this.selectAll =
      availablePokemon.length > 0 && availablePokemon.every((p) => this.isSelected(p.id));
  }

  private clearSelection(): void {
    this.selectedPokemon = [];
    this.selectAll = false;
  }

  // Métodos de UI - Usando utilidades centralizadas
  getTypeLabel(type: string): string {
    return getPokemonTypeLabel(type);
  }

  getTypeColor(type: string): string {
    return getPokemonTypeColor(type);
  }

  getStatValue(pokemon: PokeApiPokemonDetail, statName: string): number {
    return getPokemonStatValue(pokemon, statName);
  }

  getPokemonLevel(pokemon: PokeApiPokemonDetail): number {
    return getPokemonLevel(pokemon);
  }

  // Acción de agregar Pokémon
  addSinglePokemon(pokemon: PokeApiPokemonDetail): void {
    // Convertir a CapturedPokemon
    const pokemonToAdd: CapturedPokemon = {
      id: pokemon.id,
      name: pokemon.name,
      level: (pokemon as any).level || generateRandomLevel(),
      capturedAt: new Date().toISOString(),
      region: getPokemonRegion(pokemon.id),
      generation: getPokemonGeneration(pokemon.id),
      sprite:
        pokemon.sprites?.other?.['official-artwork']?.front_default ||
        pokemon.sprites?.front_default ||
        '',
      atk: pokemon.stats?.find((s) => s.stat.name === 'attack')?.base_stat || 0,
      def: pokemon.stats?.find((s) => s.stat.name === 'defense')?.base_stat || 0,
      spd: pokemon.stats?.find((s) => s.stat.name === 'speed')?.base_stat || 0,
      types: pokemon.types?.map((t) => t.type.name) || [],
      baseExperience: pokemon.base_experience || 0,
    };

    this.pokemonAdded.emit([pokemonToAdd]);

    console.log(`Agregado Pokémon: ${pokemonToAdd.name}`);
  }

  addSelectedPokemon(): void {
    if (this.selectedPokemon.length === 0) return;

    // Convertir a CapturedPokemon
    const pokemonToAdd: CapturedPokemon[] = this.selectedPokemon.map((pokemon) => ({
      id: pokemon.id,
      name: pokemon.name,
      level: (pokemon as any).level || generateRandomLevel(),
      capturedAt: new Date().toISOString(),
      region: getPokemonRegion(pokemon.id),
      generation: getPokemonGeneration(pokemon.id),
      sprite:
        pokemon.sprites?.other?.['official-artwork']?.front_default ||
        pokemon.sprites?.front_default ||
        '',
      atk: pokemon.stats?.find((s) => s.stat.name === 'attack')?.base_stat || 0,
      def: pokemon.stats?.find((s) => s.stat.name === 'defense')?.base_stat || 0,
      spd: pokemon.stats?.find((s) => s.stat.name === 'speed')?.base_stat || 0,
      types: pokemon.types?.map((t) => t.type.name) || [],
      baseExperience: pokemon.base_experience || 0,
    }));

    this.pokemonAdded.emit(pokemonToAdd);

    // Limpiar selección
    this.clearSelection();

    console.log(`Agregados ${pokemonToAdd.length} Pokémon`);
  }
}
