import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AvatarGeneratorService } from '../../avatar/avatar-generator.service';
import { TraitKey, Traits, TRAIT_LABELS } from '../../avatar/traits.model';
import { backgroundVariants } from '../../avatar/svg-parts/background';
import { headShapes, earVariants } from '../../avatar/svg-parts/head';
import { eyeVariants, browVariants } from '../../avatar/svg-parts/eyes';
import { noseVariants } from '../../avatar/svg-parts/nose';
import { mouthVariants } from '../../avatar/svg-parts/mouth';
import { hairVariants } from '../../avatar/svg-parts/hair';
import { beardVariants } from '../../avatar/svg-parts/beard';
import { moustacheVariants } from '../../avatar/svg-parts/moustache';
import { clothingVariants } from '../../avatar/svg-parts/clothes';
import { accessoryVariants } from '../../avatar/svg-parts/accessories';

interface TraitOptionGroup {
  key: TraitKey;
  label: string;
  options: string[];
}

interface Category {
  id: string;
  label: string;
  traits: TraitOptionGroup[];
}

const traitOptions: Record<TraitKey, string[]> = {
  headShape: ['Ovalada', 'Suave', 'Clásica', 'Corazón', 'Recta', 'Alta'],
  skinTone: ['Porcelana', 'Ivory', 'Miel', 'Trigueña', 'Cálida', 'Oliva', 'Ébano', 'Ébano profundo'],
  ears: ['Clásicas', 'Suaves', 'Compactas'],
  eyes: ['Clásicos', 'Almendrados', 'Relajados', 'Brillantes', 'Finos', 'Confiados', 'Minimal', 'Redondos'],
  brows: ['Arco suave', 'Asimétricas', 'Rectas', 'Curvas', 'Marcadas', 'Pobladas'],
  nose: ['Recta', 'Definida', 'Suave', 'Corta'],
  mouth: ['Sonrisa', 'Serena', 'Neutral', 'Labios suaves', 'Doble', 'Punto', 'Suave', 'Amplia'],
  hair: ['Clásico', 'Moño', 'Volumen', 'Corto', 'Largo', 'Ondulado', 'Degradado', 'Lacio', 'Coleta', 'Layer'],
  beard: ['Sin barba', 'Barba completa', 'Recortada', 'Marcada', 'Suave', 'Corta'],
  moustache: ['Sin bigote', 'Fino', 'Curvo', 'Suave'],
  clothing: ['Camiseta', 'Chaqueta', 'Capucha', 'Abrigo', 'Uniforme', 'Camisa', 'Suéter', 'Velo', 'Túnica', 'Cruzado'],
  accessory: ['Sin accesorio', 'Gafas', 'Pendientes', 'Cicatriz', 'Diadema', 'Piercing', 'Marca'],
  background: ['Sólido', 'Gradiente', 'Radial', 'Puntos', 'Rayas', 'Ondas', 'Diagonal', 'Bokeh', 'Brisa', 'Capa'],
  palette: ['Nordic', 'Sunset', 'Forest', 'Ocean', 'Berry', 'Sand']
};

const categories: Category[] = [
  {
    id: 'base',
    label: 'Base',
    traits: [
      { key: 'headShape', label: TRAIT_LABELS.headShape, options: traitOptions.headShape },
      { key: 'skinTone', label: TRAIT_LABELS.skinTone, options: traitOptions.skinTone },
      { key: 'ears', label: TRAIT_LABELS.ears, options: traitOptions.ears }
    ]
  },
  {
    id: 'face',
    label: 'Rostro',
    traits: [
      { key: 'eyes', label: TRAIT_LABELS.eyes, options: traitOptions.eyes },
      { key: 'brows', label: TRAIT_LABELS.brows, options: traitOptions.brows },
      { key: 'nose', label: TRAIT_LABELS.nose, options: traitOptions.nose },
      { key: 'mouth', label: TRAIT_LABELS.mouth, options: traitOptions.mouth }
    ]
  },
  {
    id: 'hair',
    label: 'Cabello',
    traits: [
      { key: 'hair', label: TRAIT_LABELS.hair, options: traitOptions.hair },
      { key: 'beard', label: TRAIT_LABELS.beard, options: traitOptions.beard },
      { key: 'moustache', label: TRAIT_LABELS.moustache, options: traitOptions.moustache }
    ]
  },
  {
    id: 'clothing',
    label: 'Ropa',
    traits: [
      { key: 'clothing', label: TRAIT_LABELS.clothing, options: traitOptions.clothing }
    ]
  },
  {
    id: 'accessories',
    label: 'Accesorios',
    traits: [
      { key: 'accessory', label: TRAIT_LABELS.accessory, options: traitOptions.accessory }
    ]
  },
  {
    id: 'background',
    label: 'Fondo',
    traits: [
      { key: 'background', label: TRAIT_LABELS.background, options: traitOptions.background },
      { key: 'palette', label: TRAIT_LABELS.palette, options: traitOptions.palette }
    ]
  }
];

@Component({
  selector: 'app-avatar-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './avatar-builder.component.html',
  styleUrl: './avatar-builder.component.css'
})
export class AvatarBuilderComponent {
  seed = 'avatar-demo';
  traits: Traits = this.defaultTraits();
  overrides: Partial<Traits> = {};
  safeSvg: SafeHtml = '';
  activeCategory = categories[0].id;
  readonly categories = categories;

  constructor(private avatarGenerator: AvatarGeneratorService, private sanitizer: DomSanitizer) {
    this.refreshAvatar();
  }

  setActiveCategory(categoryId: string): void {
    this.activeCategory = categoryId;
  }

  applySeed(): void {
    this.overrides = {};
    this.refreshAvatar();
  }

  randomizeAll(): void {
    this.seed = this.avatarGenerator.randomSeed();
    this.overrides = {};
    this.refreshAvatar();
  }

  randomizeCategory(): void {
    this.overrides = { ...this.traits };
    const keys = this.currentCategoryTraits().map((trait) => trait.key);
    keys.forEach((key) => {
      delete this.overrides[key];
    });
    this.seed = this.avatarGenerator.randomSeed();
    this.refreshAvatar();
  }

  reset(): void {
    this.seed = 'avatar-demo';
    this.overrides = {};
    this.refreshAvatar();
  }

  setTrait(key: TraitKey, value: number): void {
    this.overrides = { ...this.overrides, [key]: value };
    this.refreshAvatar();
  }

  copySeed(): void {
    navigator.clipboard.writeText(this.seed).catch(() => undefined);
  }

  async downloadSvg(): Promise<void> {
    const { svg } = this.avatarGenerator.generate(this.seed, this.overrides);
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    this.downloadBlob(blob, `avatar-${this.seed}.svg`);
  }

  async downloadPng(size: number): Promise<void> {
    const { svg } = this.avatarGenerator.generate(this.seed, this.overrides);
    const blob = await this.avatarGenerator.exportPng(svg, size);
    this.downloadBlob(blob, `avatar-${this.seed}-${size}.png`);
  }

  currentCategoryTraits(): TraitOptionGroup[] {
    return this.categories.find((category) => category.id === this.activeCategory)?.traits ?? [];
  }

  getOptionLabel(key: TraitKey, index: number): string {
    return traitOptions[key][index] ?? `Variante ${index + 1}`;
  }

  private refreshAvatar(): void {
    const result = this.avatarGenerator.generate(this.seed, this.overrides);
    this.traits = result.traits;
    this.safeSvg = this.sanitizer.bypassSecurityTrustHtml(result.svg);
  }

  private defaultTraits(): Traits {
    return {
      headShape: 0,
      skinTone: 0,
      ears: 0,
      eyes: 0,
      brows: 0,
      nose: 0,
      mouth: 0,
      hair: 0,
      beard: 0,
      moustache: 0,
      clothing: 0,
      accessory: 0,
      background: 0,
      palette: 0
    };
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}

export const AVATAR_VARIANT_COUNTS = {
  headShape: headShapes.length,
  skinTone: 8,
  ears: earVariants.length,
  eyes: eyeVariants.length,
  brows: browVariants.length,
  nose: noseVariants.length,
  mouth: mouthVariants.length,
  hair: hairVariants.length,
  beard: beardVariants.length,
  moustache: moustacheVariants.length,
  clothing: clothingVariants.length,
  accessory: accessoryVariants.length,
  background: backgroundVariants.length
};
