import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvatarConfig } from '../../../../../interfaces/avatar';

interface Option {
  id: string;
  label: string;
}

@Component({
  selector: 'app-avatar-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './avatar-builder.component.html',
  styleUrl: './avatar-builder.component.css'
})
export class AvatarBuilderComponent implements OnChanges {
  @Input() config?: AvatarConfig;
  @Output() configChange = new EventEmitter<AvatarConfig>();

  readonly skinToneOptions: Option[] = [
    { id: 'porcelain', label: 'Porcelana' },
    { id: 'ivory', label: 'Marfil' },
    { id: 'tan', label: 'Bronceado' },
    { id: 'umber', label: 'Tierra' },
    { id: 'ebony', label: 'Ébano' }
  ];

  readonly hairStyleOptions: Option[] = [
    { id: 'short', label: 'Corto' },
    { id: 'long', label: 'Largo' },
    { id: 'bun', label: 'Moño' },
    { id: 'mohawk', label: 'Cresta' },
    { id: 'shaved', label: 'Rapado' }
  ];

  readonly eyeColorOptions: Option[] = [
    { id: 'brown', label: 'Marrón' },
    { id: 'blue', label: 'Azul' },
    { id: 'green', label: 'Verde' },
    { id: 'gray', label: 'Gris' },
    { id: 'amber', label: 'Ámbar' }
  ];

  readonly mouthStyleOptions: Option[] = [
    { id: 'smile', label: 'Sonrisa' },
    { id: 'neutral', label: 'Neutral' },
    { id: 'frown', label: 'Serio' },
    { id: 'smirk', label: 'Pícara' }
  ];

  readonly outfitOptions: Option[] = [
    { id: 'tunic', label: 'Túnica' },
    { id: 'armor', label: 'Armadura' },
    { id: 'cloak', label: 'Capa' },
    { id: 'jacket', label: 'Chaqueta' },
    { id: 'robe', label: 'Ropa técnica' }
  ];

  readonly accessoryOptions: Option[] = [
    { id: 'glasses', label: 'Gafas' },
    { id: 'earring', label: 'Pendiente' },
    { id: 'scar', label: 'Cicatriz' },
    { id: 'mask', label: 'Máscara' }
  ];

  skinToneIndex = 0;
  hairStyle = this.hairStyleOptions[0].id;
  eyeColor = this.eyeColorOptions[0].id;
  mouthStyle = this.mouthStyleOptions[0].id;
  outfit = this.outfitOptions[0].id;
  accessories = new Set<string>();

  ngOnChanges(): void {
    if (!this.config) return;

    this.skinToneIndex = this.getOptionIndex(this.config.skinTone, this.skinToneOptions);
    this.hairStyle = this.getOptionValue(this.config.hairStyle, this.hairStyleOptions);
    this.eyeColor = this.getOptionValue(this.config.eyeColor, this.eyeColorOptions);
    this.mouthStyle = this.getOptionValue(this.config.mouthStyle, this.mouthStyleOptions);
    this.outfit = this.getOptionValue(this.config.outfit, this.outfitOptions);
    this.accessories = new Set(
      (this.config.accessories ?? []).filter((id) => this.isAllowed(id, this.accessoryOptions))
    );
  }

  onSkinToneChange(index: number) {
    const clamped = Math.max(0, Math.min(index, this.skinToneOptions.length - 1));
    this.skinToneIndex = clamped;
    this.emitConfig();
  }

  toggleAccessory(id: string) {
    if (!this.isAllowed(id, this.accessoryOptions)) return;
    if (this.accessories.has(id)) {
      this.accessories.delete(id);
    } else {
      this.accessories.add(id);
    }
    this.emitConfig();
  }

  randomize() {
    this.skinToneIndex = this.randomIndex(this.skinToneOptions.length);
    this.hairStyle = this.randomValue(this.hairStyleOptions);
    this.eyeColor = this.randomValue(this.eyeColorOptions);
    this.mouthStyle = this.randomValue(this.mouthStyleOptions);
    this.outfit = this.randomValue(this.outfitOptions);
    this.accessories = new Set(
      this.accessoryOptions
        .filter(() => Math.random() > 0.6)
        .map((option) => option.id)
    );
    this.emitConfig();
  }

  emitConfig() {
    const skinTone = this.skinToneOptions[this.skinToneIndex]?.id ?? this.skinToneOptions[0].id;
    const accessories = Array.from(this.accessories).filter((id) => this.isAllowed(id, this.accessoryOptions));

    this.configChange.emit({
      skinTone,
      hairStyle: this.getOptionValue(this.hairStyle, this.hairStyleOptions),
      eyeColor: this.getOptionValue(this.eyeColor, this.eyeColorOptions),
      mouthStyle: this.getOptionValue(this.mouthStyle, this.mouthStyleOptions),
      outfit: this.getOptionValue(this.outfit, this.outfitOptions),
      accessories
    });
  }

  private getOptionIndex(value: string | undefined, options: Option[]): number {
    const index = options.findIndex((option) => option.id === value);
    return index === -1 ? 0 : index;
  }

  private getOptionValue(value: string | undefined, options: Option[]): string {
    const exists = options.some((option) => option.id === value);
    return exists ? (value as string) : options[0].id;
  }

  private isAllowed(value: string | undefined, options: Option[]): boolean {
    return options.some((option) => option.id === value);
  }

  private randomIndex(max: number): number {
    return Math.floor(Math.random() * Math.max(1, max));
  }

  private randomValue(options: Option[]): string {
    return options[this.randomIndex(options.length)].id;
  }
}
