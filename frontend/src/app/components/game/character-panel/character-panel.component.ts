import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Character, Equipment, Item, Stats } from '../../../interfaces/game';
import { AvatarConfig } from '../../../interfaces/avatar';
import { AvatarRendererComponent } from '../../avatar/avatar-renderer.component';

type EquipmentSlotKey = keyof Equipment;

@Component({
  selector: 'app-character-panel',
  standalone: true,
  imports: [CommonModule, AvatarRendererComponent],
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

  get avatarConfig(): AvatarConfig {
    const baseConfig = this.character?.avatarConfig;
    const fallbackSeed =
      baseConfig?.seed || this.character?.avatarSeed || this.character?.name || 'avatar';
    return {
      ...baseConfig,
      seed: fallbackSeed,
      name: baseConfig?.name ?? this.character?.name ?? undefined,
      classId:
        baseConfig?.classId ?? this.mapClassNameToId(this.character?.class),
    };
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
