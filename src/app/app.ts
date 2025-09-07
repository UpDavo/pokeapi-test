import { Component, signal, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App implements OnInit {
  protected readonly title = signal('poke-api-angular');
  private translate = inject(TranslateService);

  ngOnInit() {
    // Configurar idioma por defecto
    const savedLang = localStorage.getItem('language') || 'es';
    this.translate.setDefaultLang('es');
    this.translate.use(savedLang);
  }
}
