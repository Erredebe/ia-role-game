import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { GameService, LocalSaveSummary } from '../../services/game.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent implements OnInit {
  savedGames: LocalSaveSummary[] = [];
  debugInfo: string = '';

  constructor(private gameService: GameService, private router: Router) {}

  async ngOnInit() {
    console.log('=== Landing Component Init ===');
    this.savedGames = await this.gameService.listGames();
    console.log('Loaded saved games on landing:', this.savedGames);

    // Get debug info
    try {
      const raw = localStorage.getItem('ia_game_saves');
      this.debugInfo = `localStorage size: ${raw ? raw.length : 0} bytes\nGames: ${
        this.savedGames.length
      }`;
      console.log('Debug:', this.debugInfo);
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      this.debugInfo = 'Error accessing localStorage';
    }
  }

  continueGame(id: string) {
    this.router.navigate(['/game', id]);
  }

  newGame() {
    this.router.navigate(['/create']);
  }

  testStorage() {
    console.log('=== Testing Storage ===');
    try {
      const testObj = {
        id: 'test_' + Date.now(),
        name: 'Test Game',
        timestamp: new Date().toISOString(),
      };
      const testStr = JSON.stringify(testObj);
      console.log('Saving test object:', testObj);
      localStorage.setItem('test_save', testStr);

      const retrieved = localStorage.getItem('test_save');
      console.log('Retrieved:', retrieved);

      if (retrieved === testStr) {
        console.log('✓ Storage test PASSED');
        alert('✓ Storage is working!');
      } else {
        console.error('✗ Storage test FAILED - data mismatch');
        alert('✗ Storage test failed');
      }
    } catch (error) {
      console.error('✗ Storage test ERROR:', error);
      alert('✗ Storage error: ' + error);
    }
  }

  clearStorage() {
    console.log('Clearing localStorage...');
    try {
      localStorage.removeItem('ia_game_saves');
      localStorage.removeItem('test_save');
      this.savedGames = [];
      this.debugInfo = 'Storage cleared';
      alert('Storage cleared');
    } catch (error) {
      console.error('Error clearing storage:', error);
      alert('Error clearing storage');
    }
  }
}
