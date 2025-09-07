import { Component, signal, OnInit, inject, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App implements OnInit {
  protected readonly title = signal('poke-api-angular');
  private translate = inject(TranslateService);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    // Configurar idioma por defecto
    const savedLang = isPlatformBrowser(this.platformId)
      ? localStorage.getItem('language') || 'es'
      : 'es';
    this.translate.setDefaultLang('es');
    this.translate.use(savedLang);
  }
}
