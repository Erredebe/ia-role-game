import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterClass, EnvironmentOption } from '../../character-creation.types';
import { AvatarConfig } from '../../../../interfaces/avatar';
import { AvatarRendererComponent } from '../../../avatar/avatar-renderer.component';
import { AvatarBuilderComponent } from './avatar-builder/avatar-builder.component';

@Component({
  selector: 'app-character-creation-class-step',
  standalone: true,
  imports: [CommonModule, FormsModule, AvatarRendererComponent, AvatarBuilderComponent],
  templateUrl: './class-step.component.html'
})
export class ClassStepComponent {
  @Input() name: string = '';
  @Input() availableClasses: CharacterClass[] = [];
  @Input() selectedClassId: string = '';
  @Input() currentClass?: CharacterClass;
  @Input() currentEnvironment!: EnvironmentOption;
  @Input() avatarConfig?: AvatarConfig;

  @Output() nameChange = new EventEmitter<string>();
  @Output() avatarConfigChange = new EventEmitter<AvatarConfig>();
  @Output() selectClass = new EventEmitter<string>();
}
