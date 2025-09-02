import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Home } from './pages/home/home'; // Dashboard
import { Pokedex } from './pages/pokedex/pokedex';
import { Team } from './pages/team/team';
import { NewTeam } from './pages/new-team/new-team';
import { HomeLayout } from './pages/home-layout/home-layout';
import { authGuard } from './guards/auth-guard';
import { guestGuard } from './guards/guest-guard';

export const routes: Routes = [
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'register', component: Register, canActivate: [guestGuard] },

  {
    path: '',
    component: HomeLayout,
    canActivate: [authGuard],
    children: [
      { path: '', component: Home },
      { path: 'pokedex', component: Pokedex },
      { path: 'team', component: Team },
      { path: 'new-team', component: NewTeam },
    ],
  },

  { path: '**', redirectTo: '' },
];
