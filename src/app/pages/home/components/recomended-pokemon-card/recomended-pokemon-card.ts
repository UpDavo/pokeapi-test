import { Component, Input } from '@angular/core';
import { CapturedPokemon } from '../../../../interfaces/pokemon.interface';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-recomended-pokemon-card',
  imports: [NgClass],
  templateUrl: './recomended-pokemon-card.html',
})
export class RecomendedPokemonCard {
  @Input() pokemon!: CapturedPokemon & { bst: number };
}
