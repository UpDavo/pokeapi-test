import { Component, OnDestroy, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { PokemonService } from '../../services/pokemon.service';
import { CapturedPokemon } from '../../interfaces/pokemon.interface';
import { PokemonCard } from './components/pokemon-card/pokemon-card';
import { PokemonFilter, FilterOptions } from './components/pokemon-filter/pokemon-filter';
import { CaptureModal } from './components/capture-modal/capture-modal';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PaginatorModule } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-pokedex',
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    PokemonCard,
    PokemonFilter,
    CaptureModal,
    CardModule,
    ButtonModule,
    ProgressSpinnerModule,
    PaginatorModule,
    SelectModule,
  ],
  templateUrl: './pokedex.html',
})
export class Pokedex implements OnInit, OnDestroy {
  private pokemonService = inject(PokemonService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  // Estado de UI
  isLoading = false;
  isFiltering = false;
  showCaptureModal = false;

  // Datos principales
  allPokemon: CapturedPokemon[] = [];
  filteredPokemon: CapturedPokemon[] = [];
  displayedPokemon: CapturedPokemon[] = [];

  // Paginación
  currentPage = 1;
  pageSize = 12;
  totalPages = 0;

  // Filtros activos
  activeFilters: FilterOptions = {
    search: '',
    types: [],
    regions: [],
    generations: [],
  };

  // Ordenamiento
  sortBy: 'name' | 'level' | 'capturedAt' | 'atk' | 'def' | 'spd' = 'capturedAt';
  sortOrder: 'asc' | 'desc' = 'desc';

  // Opciones de ordenamiento para PrimeNG
  sortOptions = [
    { label: '', value: 'capturedAt' },
    { label: '', value: 'name' },
    { label: '', value: 'level' },
    { label: '', value: 'atk' },
    { label: '', value: 'def' },
    { label: '', value: 'spd' },
  ];

  // Estadísticas
  get totalCount(): number {
    return this.allPokemon.length;
  }

  get filteredCount(): number {
    return this.filteredPokemon.length;
  }

  get hasNoResults(): boolean {
    return !this.isLoading && this.filteredPokemon.length === 0 && this.totalCount > 0;
  }

  get hasNoPokemons(): boolean {
    return !this.isLoading && this.totalCount === 0;
  }

  get hasActiveFilters(): boolean {
    return !!(
      this.activeFilters.search ||
      this.activeFilters.types.length > 0 ||
      this.activeFilters.regions.length > 0 ||
      this.activeFilters.generations.length > 0
    );
  }

  /** ====== Ciclo de vida ====== */
  ngOnInit(): void {
    this.loadPokemon();
    this.setupPokemonUpdates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** ====== Carga de datos ====== */
  private async loadPokemon(): Promise<void> {
    this.isLoading = true;
    this.cdr.markForCheck();

    try {
      this.allPokemon = await this.pokemonService.getMyCapturedDetailed();
      console.log('Pokémon cargados:', this.allPokemon.length);

      this.applyFiltersAndSort();
    } catch (error) {
      console.error('Error al cargar pokémon:', error);
      this.allPokemon = [];
      this.filteredPokemon = [];
      this.displayedPokemon = [];
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  private setupPokemonUpdates(): void {
    this.pokemonService.capturedPokemons$
      .pipe(takeUntil(this.destroy$), debounceTime(300))
      .subscribe(async () => {
        console.log('Detectados cambios en pokémon capturados');
        await this.loadPokemon();
      });
  }

  /** ====== Filtrado y ordenamiento ====== */
  onFilterChange(filters: FilterOptions): void {
    this.activeFilters = { ...filters };
    this.currentPage = 1; // Reset pagination
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
    this.applyFiltersAndSort();
  }

  onSortChange(sortBy: typeof this.sortBy, order: typeof this.sortOrder): void {
    this.sortBy = sortBy;
    this.sortOrder = order;
    this.applyFiltersAndSort();
  }

  private applyFiltersAndSort(): void {
    this.isFiltering = true;
    this.cdr.markForCheck();

    try {
      // Aplicar filtros
      this.filteredPokemon = this.filterPokemon(this.allPokemon, this.activeFilters);

      // Aplicar ordenamiento
      this.filteredPokemon = this.sortPokemon(this.filteredPokemon, this.sortBy, this.sortOrder);

      // Calcular paginación
      this.calculatePagination();

      // Aplicar paginación
      this.applyPagination();

      console.log(`Filtrado: ${this.filteredPokemon.length}/${this.allPokemon.length} pokémon`);
    } catch (error) {
      console.error('Error al aplicar filtros:', error);
    } finally {
      this.isFiltering = false;
      this.cdr.markForCheck();
    }
  }

  private filterPokemon(pokemon: CapturedPokemon[], filters: FilterOptions): CapturedPokemon[] {
    return pokemon.filter((p) => {
      // Filtro por búsqueda (nombre, tipo, región)
      if (filters.search) {
        const search = filters.search.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(search);
        const matchesType = p.types.some((type) => type.toLowerCase().includes(search));
        const matchesRegion = p.region?.toLowerCase().includes(search) || false;

        if (!matchesName && !matchesType && !matchesRegion) {
          return false;
        }
      }

      // Filtro por tipos (múltiples)
      if (filters.types.length > 0 && !filters.types.some((type) => p.types.includes(type))) {
        return false;
      }

      // Filtro por regiones (múltiples)
      if (filters.regions.length > 0 && (!p.region || !filters.regions.includes(p.region))) {
        return false;
      }

      // Filtro por generaciones (múltiples)
      if (
        filters.generations.length > 0 &&
        (!p.generation || !filters.generations.includes(p.generation))
      ) {
        return false;
      }

      return true;
    });
  }

  private sortPokemon(
    pokemon: CapturedPokemon[],
    sortBy: typeof this.sortBy,
    order: typeof this.sortOrder
  ): CapturedPokemon[] {
    return [...pokemon].sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (sortBy) {
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case 'capturedAt':
          valueA = new Date(a.capturedAt).getTime();
          valueB = new Date(b.capturedAt).getTime();
          break;
        default:
          valueA = a[sortBy] || 0;
          valueB = b[sortBy] || 0;
          break;
      }

      if (order === 'asc') {
        return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
      } else {
        return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
      }
    });
  }

  /** ====== Paginación ====== */
  private calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredPokemon.length / this.pageSize);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  private applyPagination(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedPokemon = this.filteredPokemon.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.applyPagination();
      this.cdr.markForCheck();
    }
  }

  onPaginatorChange(event: any): void {
    const page = event.first / event.rows + 1;
    this.currentPage = page;
    this.pageSize = event.rows;
    this.applyPagination();
    this.cdr.markForCheck();
  }

  get paginationInfo(): string {
    if (this.filteredPokemon.length === 0) return '';

    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.filteredPokemon.length);

    return `${start}-${end} de ${this.filteredPokemon.length}`;
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  /** ====== Métodos públicos ====== */
  async refreshPokedex(): Promise<void> {
    this.showCaptureModal = true;
  }

  onCaptureModalClose(): void {
    this.showCaptureModal = false;
  }

  onPokemonCaptured(pokemon: CapturedPokemon[]): void {
    console.log(`${pokemon.length} Pokémon capturados:`, pokemon);
    // Refrescar los datos
    this.loadPokemon();
    this.showCaptureModal = false;
  }

  trackByPokemonId(index: number, pokemon: CapturedPokemon): number {
    return pokemon.id;
  }
}
