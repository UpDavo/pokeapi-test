import { Component, OnDestroy, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { interval, takeUntil, Subject } from 'rxjs';
import { PokemonService } from '../../services/pokemon.service';
import { CapturedPokemon, PokemonMetrics } from '../../interfaces/pokemon.interface';
import { StatCard } from './components/stat-card/stat-card';
import { RecomendedPokemonCard } from './components/recomended-pokemon-card/recomended-pokemon-card';
import { MyPokemonCard } from './components/my-pokemon-card/my-pokemon-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [TranslateModule, StatCard, RecomendedPokemonCard, MyPokemonCard],
  templateUrl: './home.html',
})
export class Home implements OnInit, OnDestroy {
  private pokemonService = inject(PokemonService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  // Estados de carga independientes
  isLoadingMetrics = true;
  isLoadingRecentCaptures = true;
  isLoadingRecommendations = true;

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

  // Propiedades computadas para el estado general
  get isLoadingAny(): boolean {
    return this.isLoadingMetrics || this.isLoadingRecentCaptures || this.isLoadingRecommendations;
  }

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
  private loadAll(): void {
    // Iniciar todas las cargas de forma independiente
    this.loadMetricsAsync();
    this.loadRecentCapturesAsync();
    this.loadRecommendationsAsync();
  }

  /** ====== Carga asíncrona de métricas ====== */
  private async loadMetricsAsync(): Promise<void> {
    this.isLoadingMetrics = true;
    this.cdr.detectChanges();

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
    } finally {
      this.isLoadingMetrics = false;
      this.cdr.detectChanges();
    }
  }

  /** ====== Carga asíncrona de capturas recientes ====== */
  private async loadRecentCapturesAsync(): Promise<void> {
    this.isLoadingRecentCaptures = true;
    this.cdr.detectChanges();

    try {
      // Simular un pequeño delay para mostrar la carga asíncrona
      await new Promise((resolve) => setTimeout(resolve, 300));
      this.recentCaptures = this.pokemonService.getRecentCaptures(4);
      console.log('Capturas recientes cargadas:', this.recentCaptures.length);
    } catch (error) {
      console.error('Error al cargar capturas recientes:', error);
    } finally {
      this.isLoadingRecentCaptures = false;
      this.cdr.detectChanges();
    }
  }

  /** ====== Carga asíncrona de recomendaciones ====== */
  private async loadRecommendationsAsync(): Promise<void> {
    this.isLoadingRecommendations = true;
    this.cdr.detectChanges();

    try {
      // Simular un pequeño delay para mostrar la carga asíncrona
      await new Promise((resolve) => setTimeout(resolve, 500));
      this.updateRecommendations();
    } catch (error) {
      console.error('Error al cargar recomendaciones:', error);
    } finally {
      this.isLoadingRecommendations = false;
      this.cdr.detectChanges();
    }
  }

  /** ====== Recomendaciones ====== */
  private updateRecommendations(): void {
    this.recommended = this.pokemonService.getRandomTop100Recommendations();
  }

  /** ====== Métodos públicos para interacción ====== */

  /**
   * Refresca todos los datos de forma asíncrona
   */
  async refresh(): Promise<void> {
    this.loadAll();
  }

  /**
   * Refresca solo las métricas
   */
  async refreshMetrics(): Promise<void> {
    await this.loadMetricsAsync();
  }

  /**
   * Refresca solo las capturas recientes
   */
  async refreshRecentCaptures(): Promise<void> {
    await this.loadRecentCapturesAsync();
  }

  /**
   * Obtiene nuevas recomendaciones de forma asíncrona
   */
  async refreshRecommendations(): Promise<void> {
    await this.loadRecommendationsAsync();
  }
}
