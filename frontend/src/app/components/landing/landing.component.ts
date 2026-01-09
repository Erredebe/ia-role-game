import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { GameService, LocalSaveSummary } from '../../services/game.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements OnInit {
  savedGames: LocalSaveSummary[] = [];

  constructor(private gameService: GameService, private router: Router) {}

  async ngOnInit() {
    this.savedGames = await this.gameService.listGames();
  }

  continueGame(id: string) {
    this.router.navigate(['/game', id]);
  }

  newGame() {
    this.router.navigate(['/create']);
  }
}
