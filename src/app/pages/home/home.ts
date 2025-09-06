import { Component, OnDestroy, OnInit, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { interval, takeUntil, Subject } from 'rxjs';
import { PokemonService } from '../../services/pokemon.service';
import { CapturedPokemon, PokemonMetrics } from '../../interfaces/pokemon.interface';
import { StatCard } from './components/stat-card/stat-card';
import { RecomendedPokemonCard } from './components/recomended-pokemon-card/recomended-pokemon-card';
import { MyPokemonCard } from './components/my-pokemon-card/my-pokemon-card';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

const TIME_LEFT = 10 * 60 * 1000;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    TranslateModule,
    StatCard,
    RecomendedPokemonCard,
    MyPokemonCard,
    CardModule,
    ButtonModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './home.html',
})
export class Home implements OnInit, OnDestroy {
  private pokemonService = inject(PokemonService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
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

    interval(TIME_LEFT)
      .pipe(takeUntil(this.destroy$))
      .subscribe(async () => {
        console.log('Refrescando recomendaciones automáticamente...');
        await this.updateRecommendations();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** ====== Carga principal ====== */
  private loadAll(): void {
    this.loadMetricsAsync();
    this.loadRecentCapturesAsync();
    this.loadRecommendationsAsync();
  }

  /** ====== Carga asíncrona de métricas ====== */
  private async loadMetricsAsync(): Promise<void> {
    this.isLoadingMetrics = true;
    this.cdr.markForCheck();

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
      this.cdr.markForCheck();
    }
  }

  /** ====== Carga asíncrona de capturas recientes ====== */
  private async loadRecentCapturesAsync(): Promise<void> {
    this.isLoadingRecentCaptures = true;
    this.cdr.markForCheck();

    try {
      this.recentCaptures = this.pokemonService.getRecentCaptures(4);
      console.log('Capturas recientes cargadas:', this.recentCaptures.length);
    } catch (error) {
      console.error('Error al cargar capturas recientes:', error);
    } finally {
      this.isLoadingRecentCaptures = false;
      this.cdr.markForCheck();
    }
  }

  /** ====== Carga asíncrona de recomendaciones ====== */
  private async loadRecommendationsAsync(): Promise<void> {
    this.isLoadingRecommendations = true;
    this.cdr.markForCheck();

    try {
      this.recommended = await this.pokemonService.getRandomTop100Recommendations();
    } catch (error) {
      console.error('Error al cargar recomendaciones:', error);
    } finally {
      this.ngZone.run(() => {
        this.isLoadingRecommendations = false;
        this.cdr.markForCheck();
      });
    }
  }

  /** ====== Recomendaciones ====== */
  private async updateRecommendations(): Promise<void> {
    await this.loadRecommendationsAsync();
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
