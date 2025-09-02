import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, firstValueFrom, from, map, mergeMap, toArray, BehaviorSubject } from 'rxjs';
import {
  CapturedPokemon,
  PokeApiPokemonDetail,
  PokemonMetrics,
  Top100CacheEntry,
  StatName,
} from '../interfaces/pokemon.interface';
import { LocalStorageService } from './local-storage.service';

const POKEAPI_BASE = 'https://pokeapi.co/api/v2';
const CAPTURED_POKEMONS_KEY = 'captured_pokemons';
const TOP100_CACHE_KEY = 'top100_cache_v1';
const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  private http = inject(HttpClient);
  private localStorageService = inject(LocalStorageService);

  // Observable para los pokémon capturados
  private capturedPokemonsSubject = new BehaviorSubject<CapturedPokemon[]>([]);
  public capturedPokemons$ = this.capturedPokemonsSubject.asObservable();

  constructor() {
    this.loadCapturedFromStorage();
    // Limpiar caches expirados al inicializar
    this.localStorageService.cleanExpiredItems('top100_cache', TWELVE_HOURS_MS);
  }

  /** ====== Gestión de localStorage ====== */

  /**
   * Carga los pokémon capturados desde localStorage
   */
  private loadCapturedFromStorage(): void {
    const captured = this.localStorageService.getItem<CapturedPokemon[]>(CAPTURED_POKEMONS_KEY, []);
    this.capturedPokemonsSubject.next(captured);
  }

  /**
   * Guarda los pokémon capturados en localStorage
   */
  private saveCapturedToStorage(captured: CapturedPokemon[]): void {
    const success = this.localStorageService.setItem(CAPTURED_POKEMONS_KEY, captured);
    if (success) {
      this.capturedPokemonsSubject.next(captured);
    } else {
      console.error('No se pudo guardar en localStorage. Verificar espacio disponible.');
    }
  }

  /**
   * Obtiene los pokémon capturados actuales
   */
  getCapturedPokemons(): CapturedPokemon[] {
    return this.capturedPokemonsSubject.value;
  }

  /**
   * Agrega un nuevo pokémon capturado
   */
  addCapturedPokemon(pokemon: Omit<CapturedPokemon, 'capturedAt'>): void {
    const current = this.getCapturedPokemons();
    const newPokemon: CapturedPokemon = {
      ...pokemon,
      capturedAt: new Date().toISOString(),
    };

    // Evitar duplicados por ID
    const exists = current.some((p) => p.id === pokemon.id);
    if (!exists) {
      const updated = [...current, newPokemon];
      this.saveCapturedToStorage(updated);
    }
  }

  /**
   * Elimina un pokémon capturado por ID
   */
  removeCapturedPokemon(id: number): void {
    const current = this.getCapturedPokemons();
    const updated = current.filter((p) => p.id !== id);
    this.saveCapturedToStorage(updated);
  }

  /**
   * Actualiza un pokémon capturado
   */
  updateCapturedPokemon(id: number, updates: Partial<CapturedPokemon>): void {
    const current = this.getCapturedPokemons();
    const index = current.findIndex((p) => p.id === id);

    if (index !== -1) {
      const updated = [...current];
      updated[index] = { ...updated[index], ...updates };
      this.saveCapturedToStorage(updated);
    }
  }

  /**
   * Limpia todos los pokémon capturados
   */
  clearCapturedPokemons(): void {
    this.localStorageService.removeItem(CAPTURED_POKEMONS_KEY);
    this.capturedPokemonsSubject.next([]);
  }

  /** ====== API helpers ====== */

  /**
   * Obtiene el total de pokémon disponibles en la PokéAPI
   */
  async getPokedexTotal(): Promise<number> {
    try {
      const url = `${POKEAPI_BASE}/pokemon?limit=1`;
      const response: any = await firstValueFrom(this.http.get(url));
      return response?.count ?? 0;
    } catch (error) {
      console.error('Error al obtener total de pokédex:', error);
      return 0;
    }
  }

  /**
   * Obtiene los detalles de un pokémon desde la PokéAPI
   */
  async getPokemonDetail(id: number): Promise<PokeApiPokemonDetail | null> {
    try {
      return await firstValueFrom(
        this.http.get<PokeApiPokemonDetail>(`${POKEAPI_BASE}/pokemon/${id}`)
      );
    } catch (error) {
      console.error(`Error al obtener detalles del pokémon ${id}:`, error);
      return null;
    }
  }

  /**
   * Obtiene los pokémon capturados con detalles completos desde la API
   */
  async getMyCapturedDetailed(): Promise<CapturedPokemon[]> {
    const captured = this.getCapturedPokemons();

    if (!captured.length) return [];

    // Completar stats que falten
    const toComplete = captured.filter((p) => p.atk == null || !p.types?.length || !p.sprite);

    if (!toComplete.length) return captured;

    try {
      const completed = await firstValueFrom(
        from(toComplete).pipe(
          mergeMap(
            (p) =>
              this.http
                .get<PokeApiPokemonDetail>(`${POKEAPI_BASE}/pokemon/${p.id}`)
                .pipe(map((detail) => this.mergeDetailIntoCaptured(p, detail))),
            8 // concurrencia
          ),
          toArray()
        )
      );

      // Fusionar datos actualizados
      const mapById = new Map<number, CapturedPokemon>();
      captured.forEach((p) => mapById.set(p.id, p));
      completed.forEach((p) => mapById.set(p.id, p));

      const result = Array.from(mapById.values());

      // Actualizar localStorage con los datos completos
      this.saveCapturedToStorage(result);

      return result;
    } catch (error) {
      console.error('Error al completar detalles de pokémon capturados:', error);
      return captured;
    }
  }

  /**
   * Fusiona los detalles de la API con un pokémon capturado
   */
  private mergeDetailIntoCaptured(
    pokemon: CapturedPokemon,
    detail: PokeApiPokemonDetail
  ): CapturedPokemon {
    const getStat = (name: StatName) =>
      detail.stats.find((s) => s.stat.name === name)?.base_stat ?? 0;

    const atk = getStat('attack') || pokemon.atk || 0;
    const def = getStat('defense') || pokemon.def || 0;
    const spd = getStat('speed') || pokemon.spd || 0;
    const types = detail.types?.map((t) => t.type.name) ?? pokemon.types ?? [];
    const sprite =
      detail.sprites?.other?.['official-artwork']?.front_default ||
      detail.sprites?.front_default ||
      pokemon.sprite;
    const baseExperience = detail.base_experience ?? pokemon.baseExperience ?? 0;

    return {
      ...pokemon,
      atk,
      def,
      spd,
      types,
      sprite,
      baseExperience,
    };
  }

  /** ====== Métricas ====== */

  /**
   * Calcula las métricas de los pokémon capturados
   */
  async computeMetrics(captured?: CapturedPokemon[]): Promise<PokemonMetrics> {
    const pokemons = captured || (await this.getMyCapturedDetailed());
    const pokedexTotal = await this.getPokedexTotal();

    const capturedCount = pokemons.length;
    const pokedexPct = pokedexTotal ? Math.min(100, (capturedCount / pokedexTotal) * 100) : 0;

    const avgLevel = pokemons.length
      ? Math.round(pokemons.reduce((acc, p) => acc + (p.level ?? 0), 0) / pokemons.length)
      : 0;

    // Tipo favorito
    let favoriteType: string | null = null;
    if (pokemons.length) {
      const typeCounts = pokemons
        .flatMap((p) => p.types || [])
        .reduce<Record<string, number>>((acc, type) => {
          acc[type] = (acc[type] ?? 0) + 1;
          return acc;
        }, {});

      const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
      favoriteType = topType || 'Sin datos';
    } else {
      favoriteType = 'Sin datos';
    }

    const totalExp = pokemons.reduce((acc, p) => acc + (p.baseExperience ?? 0), 0);

    const strongest = pokemons.reduce<{ name: string; atk: number } | null>((max, p) => {
      const atk = p.atk ?? 0;
      if (!max || atk > max.atk) return { name: p.name, atk };
      return max;
    }, null);

    return {
      capturedCount,
      pokedexTotal,
      pokedexPct,
      avgLevel,
      favoriteType,
      totalExp,
      strongest,
    };
  }

  /** ====== Sistema de recomendaciones ====== */

  /**
   * Asegura que el cache del top 100 esté actualizado
   */
  async ensureTop100StrongCache(): Promise<void> {
    const cached = this.getTop100Cache();

    if (cached && Date.now() - cached.ts < TWELVE_HOURS_MS && Array.isArray(cached.list)) {
      return;
    }

    try {
      const total = await this.getPokedexTotal();
      const sampleSize = Math.min(350, total);
      const ids = this.randomUniqueInts(sampleSize, 1, total);

      const details: (CapturedPokemon & { bst: number })[] = await firstValueFrom(
        from(ids).pipe(
          mergeMap(
            (id) =>
              this.http.get<PokeApiPokemonDetail>(`${POKEAPI_BASE}/pokemon/${id}`).pipe(
                map((detail) => {
                  const getStat = (name: StatName) =>
                    detail.stats.find((x) => x.stat.name === name)?.base_stat ?? 0;

                  const atk = getStat('attack');
                  const def = getStat('defense');
                  const spd = getStat('speed');
                  const bst =
                    getStat('hp') +
                    atk +
                    def +
                    getStat('special-attack') +
                    getStat('special-defense') +
                    spd;

                  const types = detail.types?.map((t) => t.type.name) ?? [];
                  const sprite =
                    detail.sprites?.other?.['official-artwork']?.front_default ||
                    detail.sprites?.front_default ||
                    '';

                  return {
                    id: detail.id,
                    name: detail.name,
                    level: 0,
                    capturedAt: '',
                    sprite,
                    atk,
                    def,
                    spd,
                    types,
                    baseExperience: detail.base_experience ?? 0,
                    bst,
                  };
                })
              ),
            12 // concurrencia
          ),
          toArray(),
          map((arr) => arr.sort((a, b) => b.bst - a.bst).slice(0, 100))
        )
      );

      this.saveTop100Cache({ ts: Date.now(), list: details });
    } catch (error) {
      console.error('Error al actualizar cache del top 100:', error);
    }
  }

  /**
   * Obtiene 2 pokémon aleatorios del top 100 cache
   */
  getRandomTop100Recommendations(): (CapturedPokemon & { bst: number })[] {
    const cached = this.getTop100Cache();

    if (!cached?.list?.length) {
      return [];
    }

    const list = cached.list;
    const firstIndex = Math.floor(Math.random() * list.length);
    let secondIndex = Math.floor(Math.random() * list.length);

    while (secondIndex === firstIndex && list.length > 1) {
      secondIndex = Math.floor(Math.random() * list.length);
    }

    return [list[firstIndex], list[secondIndex]].filter(Boolean);
  }

  /**
   * Obtiene el cache del top 100
   */
  private getTop100Cache(): Top100CacheEntry | null {
    return this.localStorageService.getItem<Top100CacheEntry | null>(TOP100_CACHE_KEY, null);
  }

  /**
   * Guarda el cache del top 100
   */
  private saveTop100Cache(cache: Top100CacheEntry): void {
    this.localStorageService.setItem(TOP100_CACHE_KEY, cache);
  }

  /**
   * Limpia el cache del top 100
   */
  clearTop100Cache(): void {
    this.localStorageService.removeItem(TOP100_CACHE_KEY);
  }

  /** ====== Utilidades ====== */

  /**
   * Genera números enteros únicos aleatorios
   */
  private randomUniqueInts(count: number, min: number, max: number): number[] {
    const set = new Set<number>();
    while (set.size < count) {
      set.add(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return Array.from(set);
  }

  /**
   * Obtiene los pokémon capturados más recientes
   */
  getRecentCaptures(limit: number = 4): CapturedPokemon[] {
    const captured = this.getCapturedPokemons();
    return [...captured]
      .sort((a, b) => +new Date(b.capturedAt) - +new Date(a.capturedAt))
      .slice(0, limit);
  }

  /**
   * Obtiene estadísticas generales del almacenamiento
   */
  getStorageStats(): {
    capturedCount: number;
    storageUsage: number;
    isStorageAvailable: boolean;
    hasCachedTop100: boolean;
  } {
    const captured = this.getCapturedPokemons();
    const cache = this.getTop100Cache();

    return {
      capturedCount: captured.length,
      storageUsage: this.localStorageService.getStorageUsage(),
      isStorageAvailable: this.localStorageService.isAvailable(),
      hasCachedTop100: cache !== null && Array.isArray(cache.list),
    };
  }

  /**
   * Busca pokémon capturados por nombre o tipo
   */
  searchCapturedPokemons(query: string): CapturedPokemon[] {
    if (!query.trim()) return this.getCapturedPokemons();

    const searchTerm = query.toLowerCase().trim();
    const captured = this.getCapturedPokemons();

    return captured.filter(
      (pokemon) =>
        pokemon.name.toLowerCase().includes(searchTerm) ||
        pokemon.types.some((type) => type.toLowerCase().includes(searchTerm))
    );
  }

  /**
   * Obtiene pokémon capturados ordenados por diferentes criterios
   */
  getCapturedSorted(
    sortBy: 'name' | 'level' | 'capturedAt' | 'atk' | 'def' | 'spd',
    order: 'asc' | 'desc' = 'desc'
  ): CapturedPokemon[] {
    const captured = [...this.getCapturedPokemons()];

    captured.sort((a, b) => {
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

    return captured;
  }

  /**
   * Exporta los datos de pokémon capturados como JSON
   */
  exportCapturedData(): string {
    const data = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      captured: this.getCapturedPokemons(),
      total: this.getCapturedPokemons().length,
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Importa datos de pokémon capturados desde JSON
   */
  importCapturedData(jsonData: string): { success: boolean; message: string; imported: number } {
    try {
      const data = JSON.parse(jsonData);

      if (!data.captured || !Array.isArray(data.captured)) {
        return {
          success: false,
          message: 'Formato de datos inválido',
          imported: 0,
        };
      }

      const validPokemons: CapturedPokemon[] = data.captured.filter(
        (p: any) =>
          p &&
          typeof p.id === 'number' &&
          typeof p.name === 'string' &&
          typeof p.level === 'number' &&
          typeof p.capturedAt === 'string'
      );

      if (validPokemons.length === 0) {
        return {
          success: false,
          message: 'No se encontraron pokémon válidos en los datos',
          imported: 0,
        };
      }

      // Fusionar con datos existentes evitando duplicados por ID
      const current = this.getCapturedPokemons();
      const currentIds = new Set(current.map((p) => p.id));
      const newPokemons = validPokemons.filter((p) => !currentIds.has(p.id));

      const merged = [...current, ...newPokemons];
      this.saveCapturedToStorage(merged);

      return {
        success: true,
        message: `Se importaron ${newPokemons.length} pokémon correctamente`,
        imported: newPokemons.length,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al procesar los datos JSON',
        imported: 0,
      };
    }
  }
}
