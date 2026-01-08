import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="app-background"></div>
    <router-outlet></router-outlet>
  `,
  styleUrls: ['./app.css']
})
export class App {
  constructor(private themeService: ThemeService) {}
}
