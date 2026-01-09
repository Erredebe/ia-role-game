import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './services/theme.service';
import { GameService } from './services/game.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="app-background"></div>
    <router-outlet></router-outlet>
  `,
  styleUrls: ['./app.css'],
})
export class App {
  constructor(private themeService: ThemeService, private gameService: GameService) {
    // Test localStorage on app init
    console.log('=== App Initialization ===');
    const isStorageOk = this.gameService.testLocalStorage();
    console.log('localStorage status:', isStorageOk ? 'OK' : 'FAILED');

    // List existing games
    this.gameService.listGames().then((games) => {
      console.log('Existing games:', games);
    });
  }
}
