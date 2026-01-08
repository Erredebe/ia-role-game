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

  calculatedStats = computed(() => {
    const character = this.state()?.character;
    if (!character) return { strength: 0, dexterity: 0, intelligence: 0, luck: 0 };

    const stats = { ...character.stats };
    const equipment = character.equipment || {};

    // Sumar stats del equipo
    Object.values(equipment).forEach(item => {
      if (item && item.stats) {
        if (item.stats.strength) stats.strength += item.stats.strength;
        if (item.stats.dexterity) stats.dexterity += item.stats.dexterity;
        if (item.stats.intelligence) stats.intelligence += item.stats.intelligence;
        if (item.stats.luck) stats.luck += item.stats.luck;
      }
    });

    return stats;
  });

  getEquipmentList() {
    const eq = this.state()?.character?.equipment;
    if (!eq) return [];
    return [
      { slot: 'Cabeza', item: eq.head, key: 'head' },
      { slot: 'Cuerpo', item: eq.body, key: 'body' },
      { slot: 'Mano Princ.', item: eq.mainHand, key: 'mainHand' },
      { slot: 'Mano Sec.', item: eq.offHand, key: 'offHand' },
      { slot: 'Accesorios', item: eq.accessory1, key: 'accessory1' },
      { slot: 'Accesorios', item: eq.accessory2, key: 'accessory2' }
    ];
  }

  isEquippable(item: any): boolean {
      return ['weapon', 'armor', 'accessory'].includes(item.type);
  }

  equipItem(item: any) {
      if (!this.gameService.state()) return;
      // En un caso real, esto llamaría al backend. 
      // Por ahora simularlo en frontend es complejo sin mutar el signal directamente de forma hacky 
      // o añadir una acción 'equip' al backend.
      // Vamos a enviar un comando de texto al juego para que la IA lo gestione O 
      // implementar la lógica localmente si queremos actualización inmediata UI. 
      // Para este prototipo, enviaremos la acción narrativa.
      this.sendAction(`Me equipo ${item.name}`);
  }

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
