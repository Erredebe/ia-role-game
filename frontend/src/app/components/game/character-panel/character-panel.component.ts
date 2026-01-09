import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Character, Equipment, Item, Stats } from '../../../interfaces/game';

type EquipmentSlotKey = keyof Equipment;

@Component({
  selector: 'app-character-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './character-panel.component.html'
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

  isEquippable(item: Item): boolean {
    return ['weapon', 'armor', 'accessory'].includes(item.type);
  }
}
