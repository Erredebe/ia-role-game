import { Component, OnInit, ViewChild, ViewEncapsulation, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { ChatMessage, Item, Equipment } from '../../interfaces/game';
import { CharacterPanelComponent } from './character-panel/character-panel.component';
import { ChatPanelComponent } from './chat-panel/chat-panel.component';

type EquipmentSlotKey = keyof Equipment;

const EQUIPMENT_SLOTS: Array<{ label: string; key: EquipmentSlotKey }> = [
  { label: 'Cabeza', key: 'head' },
  { label: 'Cuerpo', key: 'body' },
  { label: 'Mano Princ.', key: 'mainHand' },
  { label: 'Mano Sec.', key: 'offHand' },
  { label: 'Accesorios', key: 'accessory1' },
  { label: 'Accesorios', key: 'accessory2' },
];

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, FormsModule, CharacterPanelComponent, ChatPanelComponent],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class GameComponent implements OnInit {
  @ViewChild(ChatPanelComponent) private chatPanel?: ChatPanelComponent;

  userInput: string = '';
  suggestedActions: string[] = [];
  equipmentCollapsed: boolean = false;
  inventoryCollapsed: boolean = false;
  isSaving: boolean = false;

  constructor(
    public gameService: GameService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  state = computed(() => this.gameService.state());
  character = computed(() => this.state()?.character);
  loading = computed(() => this.gameService.loading());
  displayHistory = computed(() => this.buildDisplayHistory(this.state()?.narrativeHistory || []));

  calculatedStats = computed(() => {
    const character = this.character();
    if (!character) return { strength: 0, dexterity: 0, intelligence: 0, luck: 0 };

    const stats = { ...character.stats };
    const equipment = character.equipment || {};

    // Sumar stats del equipo
    Object.values(equipment).forEach((item) => {
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
    const eq = this.character()?.equipment;
    if (!eq) return [];
    return EQUIPMENT_SLOTS.map((slot) => ({
      slot: slot.label,
      item: eq[slot.key],
      key: slot.key,
    }));
  }

  isEquippable(item: Item): boolean {
    return ['weapon', 'armor', 'accessory'].includes(item.type);
  }

  async equipItem(item: Item) {
    if (!this.gameService.state() || this.loading()) return;
    await this.gameService.performSystemAction('equip', item.id);
    this.scrollToBottom();
  }

  async unequipItem(slot: EquipmentSlotKey) {
    if (!this.gameService.state() || this.loading()) return;
    await this.gameService.performSystemAction('unequip', slot);
    this.scrollToBottom();
  }

  toggleEquipment() {
    this.equipmentCollapsed = !this.equipmentCollapsed;
  }

  toggleInventory() {
    this.inventoryCollapsed = !this.inventoryCollapsed;
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
        narrativeHistory: [...currentState.narrativeHistory, { role: 'user', content: text }],
      });
    }

    this.userInput = '';
    this.scrollToBottom();

    const response = await this.gameService.sendAction(text);
    this.suggestedActions = response.suggestedActions || [];
    this.scrollToBottom();
  }

  async saveGame() {
    if (this.isSaving) return;
    console.log('Save button clicked, saving current game...');
    this.isSaving = true;
    try {
      const result = await this.gameService.saveCurrentGame();
      console.log('Save result:', result);
    } finally {
      this.isSaving = false;
    }
  }

  goToLanding() {
    this.router.navigate(['/']);
  }

  resetGame() {
    // Navigate to landing to reset
    this.goToLanding();
  }

  private extractSuggestions() {
    const history = this.state()?.narrativeHistory;
    if (history && history.length > 0) {
      // En un caso real, las sugerencias vendrían del backend en el estado
      // Pero aquí las guardamos del último response.
      // Para simplificar, si recargamos, las sugerencias se pierden hasta el primer movimiento.
    }
  }

  private buildDisplayHistory(history: ChatMessage[]): ChatMessage[] {
    const output: ChatMessage[] = [];

    for (const message of history) {
      if (message.role === 'assistant') {
        output.push(...this.splitAssistantMessage(message));
        continue;
      }

      if (message.role === 'system') {
        const normalized = this.normalizeSystemContent(message.content);
        if (normalized) {
          output.push({ role: 'system', content: normalized });
        }
        continue;
      }

      output.push(message);
    }

    return output;
  }

  private splitAssistantMessage(message: ChatMessage): ChatMessage[] {
    const marker = /---\s*\[SISTEMA\]/i;
    const index = message.content.search(marker);

    if (index === -1) {
      return [message];
    }

    const narrative = message.content.slice(0, index).trim();
    let systemText = message.content.slice(index).replace(marker, '').trim();
    systemText = systemText.replace(/^[:\s-]+/, '').trim();

    const result: ChatMessage[] = [];
    if (narrative) {
      result.push({ role: 'assistant', content: narrative });
    }
    if (systemText) {
      result.push({ role: 'system', content: systemText });
    }

    return result;
  }

  private normalizeSystemContent(content: string): string | null {
    const trimmed = content.trim();
    if (!trimmed) return null;

    const match = trimmed.match(/^\[SISTEMA\]\s*:?\s*/i);
    if (!match) return null;

    const cleaned = trimmed.slice(match[0].length).trim();
    return cleaned || null;
  }

  private scrollToBottom() {
    this.chatPanel?.scrollToBottom();
  }
}
