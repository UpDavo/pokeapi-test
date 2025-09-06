import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

// PrimeNG
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

// Services
import { PokemonService } from '../../../../services/pokemon.service';

// Types
import { CapturedPokemon } from '../../../../interfaces/pokemon.interface';

// Components
import { PokemonTable } from '../pokemon-table/pokemon-table';

@Component({
  selector: 'app-capture-modal',
  imports: [CommonModule, TranslateModule, DialogModule, ButtonModule, PokemonTable],
  templateUrl: './capture-modal.html',
})
export class CaptureModal {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() pokemonCaptured = new EventEmitter<CapturedPokemon[]>();

  private readonly pokemonService = inject(PokemonService);

  onClose(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  onPokemonAdded(pokemon: CapturedPokemon[]): void {
    // Agregar los Pokémon al servicio
    pokemon.forEach((p) => this.pokemonService.addCapturedPokemon(p));

    // Emitir el evento
    this.pokemonCaptured.emit(pokemon);

    // Cerrar el modal
    this.onClose();
  }
}
