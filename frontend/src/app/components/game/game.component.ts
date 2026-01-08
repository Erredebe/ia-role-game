import { Component, ElementRef, OnInit, ViewChild, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent implements OnInit {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  
  userInput: string = '';
  suggestedActions: string[] = [];

  constructor(
    public gameService: GameService,
    private route: ActivatedRoute
  ) {}

  state = computed(() => this.gameService.state());
  loading = computed(() => this.gameService.loading());

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      await this.gameService.fetchState(id);
      this.extractSuggestions();
      this.scrollToBottom();
    }
  }

  async sendAction(action?: string) {
    const text = action || this.userInput;
    if (!text || this.loading()) return;

    // Optimistic update
    const currentState = this.gameService.state();
    if (currentState) {
      this.gameService.state.set({
        ...currentState,
        narrativeHistory: [...currentState.narrativeHistory, { role: 'user', content: text }]
      });
    }

    this.userInput = '';
    this.scrollToBottom();

    const response = await this.gameService.sendAction(text);
    this.suggestedActions = response.suggestedActions || [];
    this.scrollToBottom();
  }

  private extractSuggestions() {
    const history = this.state()?.narrativeHistory;
    if (history && history.length > 0) {
        // En un caso real, las sugerencias vendrían del backend en el estado
        // Pero aquí las guardamos del último response. 
        // Para simplificar, si recargamos, las sugerencias se pierden hasta el primer movimiento.
    }
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }
}
