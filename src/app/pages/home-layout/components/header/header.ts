import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../../../services/auth';
import { Router } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

interface MenuItem {
  label: string;
  link?: string;
  children?: MenuItem[];
}

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  imports: [RouterLink, RouterLinkActive, TranslateModule],
  standalone: true,
})
export class Header {
  menu: MenuItem[] = [
    { label: 'menu.home', link: '/' },
    { label: 'menu.pokedex', link: '/pokedex' },
    { label: 'menu.teams', link: '/team' },
  ];

  currentLang = 'es';

  constructor(private auth: Auth, private router: Router, private translate: TranslateService) {
    this.translate.use(this.currentLang);
  }

  switchLang(lang: string) {
    this.currentLang = lang;
    this.translate.use(lang);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
