import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EnvironmentOption } from '../../character-creation.types';

@Component({
  selector: 'app-character-creation-environment-step',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './environment-step.component.html'
})
export class EnvironmentStepComponent {
  @Input() environments: EnvironmentOption[] = [];
  @Input() selectedEnvironmentId: string = '';
  @Input() currentEnvironment!: EnvironmentOption;
  @Input() customRules: string = '';

  @Output() selectEnvironment = new EventEmitter<string>();
  @Output() customRulesChange = new EventEmitter<string>();
}
