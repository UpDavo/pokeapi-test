import { Component, Input } from '@angular/core';
import { CapturedPokemon } from '../../../../interfaces/pokemon.interface';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-my-pokemon-card',
  imports: [CardModule, TagModule],
  templateUrl: './my-pokemon-card.html',
})
export class MyPokemonCard {
  @Input() pokemon!: CapturedPokemon;

  getTypeSeverity(
    type: string
  ): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' | undefined {
    const typeColors: Record<
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

    return typeColors[type] || 'secondary';
  }
}
