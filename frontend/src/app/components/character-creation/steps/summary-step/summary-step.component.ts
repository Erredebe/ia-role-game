import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Item, Stats } from '../../../../interfaces/game';
import { CharacterClass, EnvironmentOption } from '../../character-creation.types';

@Component({
  selector: 'app-character-creation-summary-step',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './summary-step.component.html'
})
export class SummaryStepComponent {
  @Input() stats: Stats = { strength: 0, dexterity: 0, intelligence: 0, luck: 0 };
  @Input() isRolling: boolean = false;
  @Input() currentClass?: CharacterClass;
  @Input() backstory: string = '';
  @Input() name: string = '';
  @Input() currentEnvironment!: EnvironmentOption;
  @Input() customRules: string = '';
  @Input() initialInventory: Item[] = [];

  @Output() rollStats = new EventEmitter<void>();
  @Output() backstoryChange = new EventEmitter<string>();
}
