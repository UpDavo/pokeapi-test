import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  interval,
  firstValueFrom,
  from,
  map,
  mergeMap,
  toArray,
  BehaviorSubject,
  catchError,
  of,
  EMPTY,
} from 'rxjs';
import {
  CapturedPokemon,
  PokeApiPokemonDetail,
  PokemonMetrics,
  StatName,
} from '../interfaces/pokemon.interface';
import { LocalStorageService } from './local-storage.service';

const POKEAPI_BASE = 'https://pokeapi.co/api/v2';
const CAPTURED_POKEMONS_KEY = 'captured_pokemons';

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
      // Validar que el ID esté en un rango razonable
      if (id < 1 || id > 1010) {
        console.warn(`ID de pokémon fuera del rango válido: ${id}`);
        return null;
      }

      return await firstValueFrom(
        this.http.get<PokeApiPokemonDetail>(`${POKEAPI_BASE}/pokemon/${id}`).pipe(
          catchError((error) => {
            if (error.status === 404) {
              console.warn(`Pokémon con ID ${id} no encontrado en la PokéAPI`);
            } else {
              console.error(`Error al obtener detalles del pokémon ${id}:`, error);
            }
            return of(null);
          })
        )
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
              this.http.get<PokeApiPokemonDetail>(`${POKEAPI_BASE}/pokemon/${p.id}`).pipe(
                map((detail) => this.mergeDetailIntoCaptured(p, detail)),
                catchError((error) => {
                  console.warn(
                    `No se pudieron obtener detalles para pokémon ${p.name} (ID: ${p.id}):`,
                    error.status
                  );
                  return of(p); // Devolver el pokémon sin modificar si hay error
                })
              ),
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
   * Obtiene pokémon aleatorios fuertes para recomendaciones (sin caché)
   */
  async ensureTop100StrongCache(): Promise<void> {
    // Simplemente retornamos, ya no cacheamos nada
    // Las recomendaciones se generarán on-demand
    return;
  }

  /**
   * Obtiene los 2 pokémon más fuertes de forma aleatoria desde la API
   */
  async getRandomTop100Recommendations(): Promise<(CapturedPokemon & { bst: number })[]> {
    try {
      console.log('Obteniendo pokémon más fuertes desde la API...');

      // Obtener lista de pokémon (limitamos a 200 para no sobrecargar)
      const pokemonListResponse = await firstValueFrom(
        this.http.get<{ results: { name: string; url: string }[] }>(
          `${POKEAPI_BASE}/pokemon?limit=200`
        )
      );

      const pokemons = pokemonListResponse.results;

      // Seleccionar 20 pokémon aleatorios para evaluar (para optimizar las llamadas)
      const randomPokemons = this.getRandomSelection(pokemons, 20);

      // Obtener detalles y calcular BST
      const pokemonDetails = await firstValueFrom(
        from(randomPokemons).pipe(
          mergeMap(
            (pokemon) =>
              this.http.get<PokeApiPokemonDetail>(pokemon.url).pipe(
                map((detail) => {
                  const getStat = (name: StatName) =>
                    detail.stats.find((s) => s.stat.name === name)?.base_stat ?? 0;

                  const bst = detail.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
                  const atk = getStat('attack');
                  const def = getStat('defense');
                  const spd = getStat('speed');
                  const types = detail.types?.map((t) => t.type.name) ?? [];
                  const sprite =
                    detail.sprites?.other?.['official-artwork']?.front_default ||
                    detail.sprites?.front_default ||
                    '';

                  return {
                    id: detail.id,
                    name: detail.name,
                    level: Math.floor(Math.random() * 30) + 70, // Nivel alto 70-100
                    capturedAt: '',
                    region: null,
                    generation: null,
                    sprite,
                    atk,
                    def,
                    spd,
                    types,
                    baseExperience: detail.base_experience ?? 0,
                    bst,
                  };
                }),
                catchError((error) => {
                  console.warn(`Error obteniendo detalles de ${pokemon.name}:`, error);
                  return EMPTY;
                })
              ),
            6 // concurrencia limitada
          ),
          toArray(),
          map(
            (arr) =>
              arr
                .filter(Boolean)
                .sort((a, b) => b.bst - a.bst) // Ordenar por BST descendente
                .slice(0, 2) // Tomar los 2 más fuertes
          )
        )
      );

      console.log('Pokémon más fuertes obtenidos:', pokemonDetails.length);
      return pokemonDetails;
    } catch (error) {
      console.error('Error al obtener pokémon más fuertes:', error);
      // Fallback: devolver pokémon simulados si falla la API
      return this.getFallbackRecommendations();
    }
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
   * Obtiene una selección aleatoria de elementos de un array
   */
  private getRandomSelection<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Recomendaciones de fallback cuando falla la API
   */
  private getFallbackRecommendations(): (CapturedPokemon & { bst: number })[] {
    const strongPokemonIds = [150, 249, 250, 382, 383, 384, 483, 484]; // Legendarios conocidos
    const selectedIds = this.getRandomSelection(strongPokemonIds, 2);

    return selectedIds.map((id) => ({
      id,
      name: `Pokemon-${id}`,
      level: Math.floor(Math.random() * 30) + 70,
      capturedAt: '',
      region: null,
      generation: null,
      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
      atk: Math.floor(Math.random() * 50) + 120,
      def: Math.floor(Math.random() * 50) + 100,
      spd: Math.floor(Math.random() * 50) + 110,
      types: ['dragon'], // Tipo común en legendarios
      baseExperience: 350,
      bst: Math.floor(Math.random() * 100) + 600, // BST muy alto
    }));
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
  } {
    const captured = this.getCapturedPokemons();

    return {
      capturedCount: captured.length,
      storageUsage: this.localStorageService.getStorageUsage(),
      isStorageAvailable: this.localStorageService.isAvailable(),
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
