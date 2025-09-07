import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CapturedPokemon } from '../../../../interfaces/pokemon.interface';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';

// Utils
import {
  getPokemonTypeClass,
  getPokemonTypeSeverity,
  formatCaptureDate,
} from '../../../../utils/uiUtils';

@Component({
  selector: 'app-pokemon-card',
  imports: [CommonModule, TranslateModule, CardModule, TagModule, BadgeModule],
  templateUrl: './pokemon-card.html',
})
export class PokemonCard {
  @Input() pokemon!: CapturedPokemon;
  @Input() showCaptureDate = true;
  @Input() showLevel = true;
  @Input() showStats = true;

  get formattedCaptureDate(): string {
    if (!this.pokemon?.capturedAt) return '';
    return formatCaptureDate(this.pokemon.capturedAt);
  }

  get typeClasses(): string {
    if (!this.pokemon?.types?.length) return 'bg-gray-100';
    const primaryType = this.pokemon.types[0];
    return getPokemonTypeClass(primaryType);
  }

  getTypeStyle(type: string): string {
    return getPokemonTypeClass(type);
  }

  getTypeSeverity(
    type: string
  ): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' | undefined {
    return getPokemonTypeSeverity(type);
  }
}
