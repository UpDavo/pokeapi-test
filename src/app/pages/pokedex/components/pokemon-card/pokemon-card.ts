import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CapturedPokemon } from '../../../../interfaces/pokemon.interface';

@Component({
  selector: 'app-pokemon-card',
  imports: [CommonModule, TranslateModule],
  templateUrl: './pokemon-card.html',
})
export class PokemonCard {
  @Input() pokemon!: CapturedPokemon;
  @Input() showCaptureDate = true;
  @Input() showLevel = true;
  @Input() showStats = true;

  get formattedCaptureDate(): string {
    if (!this.pokemon?.capturedAt) return '';
    const date = new Date(this.pokemon.capturedAt);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  get typeClasses(): string {
    if (!this.pokemon?.types?.length) return 'bg-gray-100';
    const primaryType = this.pokemon.types[0];
    return this.getTypeClass(primaryType);
  }

  private getTypeClass(type: string): string {
    const typeColors: Record<string, string> = {
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
    return typeColors[type] || 'bg-gray-200 text-gray-800';
  }

  getTypeStyle(type: string): string {
    return this.getTypeClass(type);
  }
}
