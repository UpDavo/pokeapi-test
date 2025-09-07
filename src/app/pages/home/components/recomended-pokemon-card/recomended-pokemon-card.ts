import { Component, Input } from '@angular/core';
import { CapturedPokemon } from '../../../../interfaces/pokemon.interface';
import { TranslateModule } from '@ngx-translate/core';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';

// Utils
import { getPokemonTypeSeverity } from '../../../../utils/uiUtils';

@Component({
  selector: 'app-recomended-pokemon-card',
  imports: [TranslateModule, CardModule, TagModule, BadgeModule],
  templateUrl: './recomended-pokemon-card.html',
})
export class RecomendedPokemonCard {
  @Input() pokemon!: CapturedPokemon & { bst: number };

  getTypeSeverity(
    type: string
  ): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' | undefined {
    return getPokemonTypeSeverity(type);
  }
}
