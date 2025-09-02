import { Component, Input } from '@angular/core';
import { CapturedPokemon } from '../../../../interfaces/pokemon.interface';

@Component({
  selector: 'app-my-pokemon-card',
  imports: [],
  templateUrl: './my-pokemon-card.html',
})
export class MyPokemonCard {
  @Input() pokemon!: CapturedPokemon;
}
