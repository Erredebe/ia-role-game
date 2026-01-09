import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Character, Equipment, Item, Stats } from '../../../interfaces/game';

type EquipmentSlotKey = keyof Equipment;

@Component({
  selector: 'app-character-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './character-panel.component.html',
  styleUrl: './character-panel.component.css'
})
export class CharacterPanelComponent {
  @Input() character?: Character | null;
  @Input() calculatedStats: Stats = { strength: 0, dexterity: 0, intelligence: 0, luck: 0 };
  @Input() equipmentList: Array<{ slot: string; item?: Item; key: EquipmentSlotKey }> = [];
  @Input() equipmentCollapsed: boolean = false;
  @Input() inventoryCollapsed: boolean = false;

  @Output() toggleEquipment = new EventEmitter<void>();
  @Output() toggleInventory = new EventEmitter<void>();
  @Output() equipItem = new EventEmitter<Item>();
  @Output() unequipItem = new EventEmitter<EquipmentSlotKey>();

  get classImage(): string | null {
    const classId = this.mapClassNameToId(this.character?.class);
    if (!classId) return null;
    const imageMap: Record<string, string> = {
      warrior: 'assets/guerrero.png',
      archer: 'assets/arquero.png',
      rogue: 'assets/picaro.png',
      soldier: 'assets/soldado.png',
      investigator: 'assets/investigador.png',
      medic: 'assets/medic.png',
    };
    return imageMap[classId] || null;
  }

  get classInitial(): string {
    const source = (this.character?.class || this.character?.name || '').trim();
    if (!source) return '?';
    return source.charAt(0).toUpperCase();
  }

  isEquippable(item: Item): boolean {
    return ['weapon', 'armor', 'accessory'].includes(item.type);
  }

  private mapClassNameToId(className?: string): string | undefined {
    if (!className) return undefined;
    const normalized = className.trim().toLowerCase();
    const map: Record<string, string> = {
      guerrero: 'warrior',
      mago: 'mage',
      arquero: 'archer',
      picaro: 'rogue',
      soldado: 'soldier',
      hacker: 'hacker',
      piloto: 'pilot',
      investigador: 'investigator',
      medico: 'medic',
      mecanico: 'mechanic'
    };
    return map[normalized];
  }
}
