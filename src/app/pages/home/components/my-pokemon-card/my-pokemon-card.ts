import { Component, Input } from '@angular/core';
import { CapturedPokemon } from '../../../../interfaces/pokemon.interface';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

// Utils
import { getPokemonTypeSeverity } from '../../../../utils/uiUtils';

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
    return getPokemonTypeSeverity(type);
  }
}
