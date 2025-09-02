import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';

@Component({
  selector: 'app-home-layout',
  imports: [RouterOutlet, Header],
  templateUrl: './home-layout.html',
})
export class HomeLayout {}
