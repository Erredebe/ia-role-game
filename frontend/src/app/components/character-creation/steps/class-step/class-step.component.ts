import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterClass, EnvironmentOption } from '../../character-creation.types';

@Component({
  selector: 'app-character-creation-class-step',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './class-step.component.html'
})
export class ClassStepComponent {
  @Input() name: string = '';
  @Input() avatarSeed: string = '';
  @Input() availableClasses: CharacterClass[] = [];
  @Input() selectedClassId: string = '';
  @Input() currentClass?: CharacterClass;
  @Input() currentEnvironment!: EnvironmentOption;
  @Input() avatarUrl: string = '';

  @Output() nameChange = new EventEmitter<string>();
  @Output() avatarSeedChange = new EventEmitter<string>();
  @Output() randomizeAvatarSeed = new EventEmitter<void>();
  @Output() selectClass = new EventEmitter<string>();
}
