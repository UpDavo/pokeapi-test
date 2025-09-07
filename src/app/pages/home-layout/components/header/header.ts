import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../../../services/auth.service';
import { Router } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { AvatarModule } from 'primeng/avatar';
import { OverlayModule } from 'primeng/overlay';
import { DrawerModule } from 'primeng/drawer';
import { MenuItem as PrimeMenuItem } from 'primeng/api';
import { isPlatformBrowser } from '@angular/common';

interface MenuItem {
  label: string;
  link?: string;
  children?: MenuItem[];
}

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  imports: [
    RouterLink,
    // RouterLinkActive,
    TranslateModule,
    MenubarModule,
    ButtonModule,
    MenuModule,
    AvatarModule,
    OverlayModule,
    DrawerModule,
  ],
  standalone: true,
})
export class Header {
  menu: MenuItem[] = [
    { label: 'menu.home', link: '/' },
    { label: 'menu.pokedex', link: '/pokedex' },
    { label: 'menu.teams', link: '/team' },
  ];

  // Menú para PrimeNG
  primeMenuItems: PrimeMenuItem[] = [];
  userMenuItems: PrimeMenuItem[] = [];
  languageMenuItems: PrimeMenuItem[] = [];

  currentLang = 'es';
  sidebarVisible = false;

  constructor(
    private auth: Auth, 
    private router: Router, 
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Obtener idioma guardado o usar español por defecto
    if (isPlatformBrowser(this.platformId)) {
      this.currentLang = localStorage.getItem('language') || 'es';
    }
    this.translate.setDefaultLang(this.currentLang);
    this.translate.use(this.currentLang);
    this.setupMenus();

    // Suscribirse a cambios de idioma para actualizar los menús
    this.translate.onLangChange.subscribe(() => {
      this.setupMenus();
    });
  }

  setupMenus() {
    // Menú principal
    this.primeMenuItems = [
      {
        label: this.translate.instant('menu.home'),
        routerLink: '/',
        styleClass: 'text-white hover:bg-gray-700',
      },
      {
        label: this.translate.instant('menu.pokedex'),
        routerLink: '/pokedex',
        styleClass: 'text-white hover:bg-gray-700',
      },
      // {
      //   label: this.translate.instant('menu.teams'),
      //   routerLink: '/team',
      //   styleClass: 'text-white hover:bg-gray-700'
      // }
    ];

    // Menú de usuario
    this.userMenuItems = [
      {
        label: this.translate.instant('menu.profile'),
        icon: 'pi pi-user',
      },
      {
        label: this.translate.instant('menu.settings'),
        icon: 'pi pi-cog',
      },
      {
        separator: true,
      },
      {
        label: this.translate.instant('menu.logout'),
        icon: 'pi pi-sign-out',
        command: () => this.logout(),
      },
    ];

    // Menú de idiomas
    this.languageMenuItems = [
      {
        label: 'Español 🇪🇸',
        command: () => this.switchLang('es'),
      },
      {
        label: 'English 🇺🇸',
        command: () => this.switchLang('en'),
      },
      {
        label: 'Português 🇧🇷',
        command: () => this.switchLang('pt'),
      },
    ];
  }

  switchLang(lang: string) {
    this.currentLang = lang;
    this.translate.use(lang);
    // Guardar idioma en localStorage
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('language', lang);
    }
    // setupMenus() se llamará automáticamente por la suscripción onLangChange
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }
}
