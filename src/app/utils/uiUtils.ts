import { PokeApiPokemonDetail } from '../interfaces/pokemon.interface';

/**
 * Utilidades para UI relacionadas con Pokémon
 */

// === COLORES Y ESTILOS DE TIPOS POKÉMON ===

/**
 * Colores hexadecimales para tipos de Pokémon
 */
export const POKEMON_TYPE_COLORS: Record<string, string> = {
  normal: '#A8A878',
  fighting: '#C03028',
  flying: '#A890F0',
  poison: '#A040A0',
  ground: '#E0C068',
  rock: '#B8A038',
  bug: '#A8B820',
  ghost: '#705898',
  steel: '#B8B8D0',
  fire: '#F08030',
  water: '#6890F0',
  grass: '#78C850',
  electric: '#F8D030',
  psychic: '#F85888',
  ice: '#98D8D8',
  dragon: '#7038F8',
  dark: '#705848',
  fairy: '#EE99AC',
};

/**
 * Clases de Tailwind CSS para tipos de Pokémon (para badges/tags)
 */
export const POKEMON_TYPE_CLASSES: Record<string, string> = {
  normal: 'bg-gray-200 text-gray-800',
  fighting: 'bg-red-200 text-red-800',
  flying: 'bg-blue-200 text-blue-800',
  poison: 'bg-purple-200 text-purple-800',
  ground: 'bg-yellow-200 text-yellow-800',
  rock: 'bg-stone-200 text-stone-800',
  bug: 'bg-green-200 text-green-800',
  ghost: 'bg-indigo-200 text-indigo-800',
  steel: 'bg-slate-200 text-slate-800',
  fire: 'bg-orange-200 text-orange-800',
  water: 'bg-cyan-200 text-cyan-800',
  grass: 'bg-emerald-200 text-emerald-800',
  electric: 'bg-yellow-200 text-yellow-800',
  psychic: 'bg-pink-200 text-pink-800',
  ice: 'bg-sky-200 text-sky-800',
  dragon: 'bg-violet-200 text-violet-800',
  dark: 'bg-gray-700 text-gray-100',
  fairy: 'bg-rose-200 text-rose-800',
};

/**
 * Severidad de PrimeNG para tipos de Pokémon
 */
export const POKEMON_TYPE_SEVERITIES: Record<
  string,
  'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast'
> = {
  grass: 'success',
  bug: 'success',
  water: 'info',
  ice: 'info',
  electric: 'warning',
  psychic: 'warning',
  fire: 'danger',
  fighting: 'danger',
  dragon: 'danger',
  rock: 'secondary',
  steel: 'secondary',
  ground: 'secondary',
  ghost: 'contrast',
  poison: 'contrast',
  dark: 'contrast',
  fairy: 'info',
  normal: 'secondary',
};

// === FUNCIONES DE UTILIDAD ===

/**
 * Obtiene el color hexadecimal para un tipo de Pokémon
 */
export function getPokemonTypeColor(type: string): string {
  return POKEMON_TYPE_COLORS[type] || '#68D391';
}

/**
 * Obtiene las clases CSS de Tailwind para un tipo de Pokémon
 */
export function getPokemonTypeClass(type: string): string {
  return POKEMON_TYPE_CLASSES[type] || 'bg-gray-200 text-gray-800';
}

/**
 * Obtiene la severidad de PrimeNG para un tipo de Pokémon
 */
export function getPokemonTypeSeverity(
  type: string
): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' {
  return POKEMON_TYPE_SEVERITIES[type] || 'secondary';
}

/**
 * Capitaliza la primera letra de un string
 */
export function getPokemonTypeLabel(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * Obtiene el valor de una estadística específica de un Pokémon
 */
export function getPokemonStatValue(pokemon: PokeApiPokemonDetail, statName: string): number {
  return pokemon.stats?.find((s) => s.stat.name === statName)?.base_stat || 0;
}

/**
 * Obtiene el nivel de un Pokémon (si está extendido con level)
 */
export function getPokemonLevel(pokemon: PokeApiPokemonDetail): number {
  return (pokemon as any).level || 1;
}

/**
 * Genera un nivel aleatorio entre 1 y 100
 */
export function generateRandomLevel(): number {
  return Math.floor(Math.random() * 100) + 1;
}

// === FUNCIONES DE GENERACIÓN Y REGIÓN ===

/**
 * Obtiene la generación de un Pokémon basado en su ID
 */
export function getPokemonGeneration(id: number): string {
  if (id >= 1 && id <= 151) return '1';
  if (id >= 152 && id <= 251) return '2';
  if (id >= 252 && id <= 386) return '3';
  if (id >= 387 && id <= 493) return '4';
  if (id >= 494 && id <= 649) return '5';
  if (id >= 650 && id <= 721) return '6';
  if (id >= 722 && id <= 809) return '7';
  if (id >= 810 && id <= 905) return '8';
  return '1'; // Por defecto
}

/**
 * Obtiene la región de un Pokémon basado en su ID
 */
export function getPokemonRegion(id: number): string {
  if (id >= 1 && id <= 151) return 'kanto';
  if (id >= 152 && id <= 251) return 'johto';
  if (id >= 252 && id <= 386) return 'hoenn';
  if (id >= 387 && id <= 493) return 'sinnoh';
  if (id >= 494 && id <= 649) return 'unova';
  if (id >= 650 && id <= 721) return 'kalos';
  if (id >= 722 && id <= 809) return 'alola';
  if (id >= 810 && id <= 905) return 'galar';
  return 'kanto'; // Por defecto
}

// === CONSTANTES DE DATOS ===

/**
 * Lista de todos los tipos de Pokémon disponibles
 */
export const POKEMON_TYPES = [
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

/**
 * Lista de todas las regiones de Pokémon
 */
export const POKEMON_REGIONS = [
  'kanto',
  'johto',
  'hoenn',
  'sinnoh',
  'unova',
  'kalos',
  'alola',
  'galar',
];

/**
 * Lista de todas las generaciones de Pokémon
 */
export const POKEMON_GENERATIONS = ['1', '2', '3', '4', '5', '6', '7', '8'];

// === FUNCIONES DE FORMATO ===

/**
 * Formatea una fecha de captura para mostrar
 */
export function formatCaptureDate(capturedAt: string): string {
  if (!capturedAt) return '';
  const date = new Date(capturedAt);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}