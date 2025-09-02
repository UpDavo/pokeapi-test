import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { interval, takeUntil, Subject } from 'rxjs';
import { DecimalPipe } from '@angular/common';
import { PokemonService } from '../../services/pokemon.service';
import { CapturedPokemon, PokemonMetrics } from '../../interfaces/pokemon.interface';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [TranslateModule, DecimalPipe],
  templateUrl: './home.html',
})
export class Home implements OnInit, OnDestroy {
  private pokemonService = inject(PokemonService);
  private destroy$ = new Subject<void>();

  // Métricas
  capturedCount = 0;
  pokedexTotal = 0;
  pokedexPct = 0;
  avgLevel = 0;
  favoriteType: string | null = null;
  totalExp = 0;
  strongest: { name: string; atk: number } | null = null;

  // Listas
  recentCaptures: CapturedPokemon[] = [];
  recommended: (CapturedPokemon & { bst: number })[] = [];

  /** ====== Ciclo de vida ====== */
  ngOnInit(): void {
    this.loadAll();

    // Rotar recomendados cada 10 min
    interval(10 * 60 * 1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateRecommendations());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** ====== Carga principal ====== */
  private async loadAll(): Promise<void> {
    try {
      // 1) Cargar métricas
      await this.loadMetrics();

      // 2) Obtener capturas recientes
      this.recentCaptures = this.pokemonService.getRecentCaptures(4);

      // 3) Asegurar cache del top 100 y obtener recomendaciones
      await this.pokemonService.ensureTop100StrongCache();
      this.updateRecommendations();
    } catch (error) {
      console.error('Error al cargar datos del home:', error);
    }
  }

  /** ====== Métricas ====== */
  private async loadMetrics(): Promise<void> {
    try {
      const metrics = await this.pokemonService.computeMetrics();
      this.capturedCount = metrics.capturedCount;
      this.pokedexTotal = metrics.pokedexTotal;
      this.pokedexPct = metrics.pokedexPct;
      this.avgLevel = metrics.avgLevel;
      this.favoriteType = metrics.favoriteType;
      this.totalExp = metrics.totalExp;
      this.strongest = metrics.strongest;
    } catch (error) {
      console.error('Error al cargar métricas:', error);
    }
  }

  /** ====== Recomendaciones ====== */
  private updateRecommendations(): void {
    this.recommended = this.pokemonService.getRandomTop100Recommendations();
  }

  /** ====== Métodos públicos para interacción ====== */
  
  /**
   * Refresca todos los datos
   */
  async refresh(): Promise<void> {
    await this.loadAll();
  }

  /**
   * Obtiene nuevas recomendaciones
   */
  refreshRecommendations(): void {
    this.updateRecommendations();
  }
}
