import { Component, Input } from '@angular/core';
import { CapturedPokemon } from '../../../../interfaces/pokemon.interface';
import { NgClass } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';

@Component({
  selector: 'app-recomended-pokemon-card',
  imports: [NgClass, TranslateModule, CardModule, TagModule, BadgeModule],
  templateUrl: './recomended-pokemon-card.html',
})
export class RecomendedPokemonCard {
  @Input() pokemon!: CapturedPokemon & { bst: number };

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
