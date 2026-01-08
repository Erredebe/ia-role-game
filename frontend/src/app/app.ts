import { Component, OnInit, signal, ElementRef, ViewChild, AfterViewChecked, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from './services/game.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit, AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  private gameService = inject(GameService);
  state = this.gameService.state;
  loading = this.gameService.loading;
  userInput = '';
  suggestedActions: string[] = [];

  constructor() {}

  ngOnInit() {
    this.gameService.fetchState();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  async sendAction(action?: string) {
    const text = action || this.userInput;
    if (!text.trim() || this.loading()) return;
    
    this.userInput = '';
    this.suggestedActions = [];
    
    try {
      const resp = await this.gameService.sendAction(text);
      this.suggestedActions = resp.suggestedActions || [];
    } catch (e) {
      console.error(e);
    }
  }

  async resetGame() {
    await this.gameService.resetGame();
    this.suggestedActions = [];
  }

  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch(err) {}
  }
}
