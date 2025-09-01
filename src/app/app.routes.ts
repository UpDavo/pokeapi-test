import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Home } from './pages/home/home';
import { Pokedex } from './pages/pokedex/pokedex';
import { Team } from './pages/team/team';
import { NewTeam } from './pages/new-team/new-team';
import { authGuard } from './guards/auth-guard';
import { guestGuard } from './guards/guest-guard';

export const routes: Routes = [
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'register', component: Register, canActivate: [guestGuard] },

  { path: 'home', component: Home, canActivate: [authGuard] },
  { path: 'pokedex', component: Pokedex, canActivate: [authGuard] },
  { path: 'team', component: Team, canActivate: [authGuard] },
  { path: 'new-team', component: NewTeam, canActivate: [authGuard] },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
