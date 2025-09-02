/** ====== Tipos ====== */
export type StatName = 'hp' | 'attack' | 'defense' | 'special-attack' | 'special-defense' | 'speed';

export interface CapturedPokemon {
  id: number;
  name: string;
  level: number; // nivel del usuario
  capturedAt: string; // ISO
  sprite: string;
  atk: number;
  def: number;
  spd: number;
  types: string[];
  baseExperience: number;
}

/** Resultado mínimo de PokeAPI /pokemon/{id|name} */
export interface PokeApiPokemonDetail {
  id: number;
  name: string;
  base_experience: number;
  sprites: {
    other?: { ['official-artwork']?: { front_default?: string } };
    front_default?: string;
  };
  stats: { base_stat: number; stat: { name: StatName } }[];
  types: { slot: number; type: { name: string } }[];
}

export interface PokemonMetrics {
  capturedCount: number;
  pokedexTotal: number;
  pokedexPct: number;
  avgLevel: number;
  favoriteType: string | null;
  totalExp: number;
  strongest: { name: string; atk: number } | null;
}

export interface Top100CacheEntry {
  ts: number;
  list: (CapturedPokemon & { bst: number })[];
}
