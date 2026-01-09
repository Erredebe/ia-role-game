import { Injectable } from '@angular/core';
import { createSeededRng, hashString, normalizeIndex, pickIndex } from './rng.util';
import { Traits } from './traits.model';
import { backgroundVariants } from './svg-parts/background';
import { renderHead, headShapes, earVariants } from './svg-parts/head';
import { renderEyes, eyeVariants, browVariants } from './svg-parts/eyes';
import { renderNose, noseVariants } from './svg-parts/nose';
import { renderMouth, mouthVariants } from './svg-parts/mouth';
import { renderHair, hairVariants } from './svg-parts/hair';
import { renderBeard, beardVariants } from './svg-parts/beard';
import { renderMoustache, moustacheVariants } from './svg-parts/moustache';
import { renderClothing, clothingVariants } from './svg-parts/clothes';
import { renderAccessories, accessoryVariants } from './svg-parts/accessories';
import { SvgColors, SvgIds } from './svg-parts/types';

interface Palette {
  name: string;
  hair: string;
  hairShadow: string;
  clothing: string;
  clothingShadow: string;
  clothingDetail: string;
  accessory: string;
  background: [string, string, string];
}

const SKIN_TONES = [
  { skin: '#F4D4C7', shadow: '#E2B7A6', highlight: '#F9E2D7' },
  { skin: '#EFC4A5', shadow: '#D9A08A', highlight: '#F6D6C5' },
  { skin: '#E2B08C', shadow: '#C88E6F', highlight: '#F0C8A9' },
  { skin: '#C9926E', shadow: '#A87557', highlight: '#D6A77E' },
  { skin: '#AA7455', shadow: '#8E5B43', highlight: '#C08A68' },
  { skin: '#8A5A3E', shadow: '#6E4632', highlight: '#A8704E' },
  { skin: '#6C4330', shadow: '#553528', highlight: '#84563E' },
  { skin: '#4E3326', shadow: '#3B261D', highlight: '#644233' }
];

const PALETTES: Palette[] = [
  {
    name: 'Nordic',
    hair: '#2F2A2E',
    hairShadow: '#1F1B1F',
    clothing: '#3A5BA0',
    clothingShadow: '#2D467A',
    clothingDetail: '#EAC87C',
    accessory: '#E0B66C',
    background: ['#F5F2FF', '#DDE5FF', '#A6B7F5']
  },
  {
    name: 'Sunset',
    hair: '#3C2B2B',
    hairShadow: '#2A1D1D',
    clothing: '#C84B31',
    clothingShadow: '#A53C28',
    clothingDetail: '#F3C77C',
    accessory: '#F4A261',
    background: ['#FFE9D0', '#FFC7A1', '#F28482']
  },
  {
    name: 'Forest',
    hair: '#2D2A28',
    hairShadow: '#1E1C1A',
    clothing: '#2F6B4F',
    clothingShadow: '#265640',
    clothingDetail: '#C9B26D',
    accessory: '#D4A373',
    background: ['#E6F2E6', '#C9E4D0', '#8EC5B0']
  },
  {
    name: 'Ocean',
    hair: '#2A2E36',
    hairShadow: '#1F2228',
    clothing: '#2D6A8E',
    clothingShadow: '#24556F',
    clothingDetail: '#B9E3E2',
    accessory: '#8EC6C5',
    background: ['#E3F4FF', '#C2E4F4', '#88BBD8']
  },
  {
    name: 'Berry',
    hair: '#2C2330',
    hairShadow: '#1B141F',
    clothing: '#7E3F98',
    clothingShadow: '#62307A',
    clothingDetail: '#F4C95D',
    accessory: '#F08A5D',
    background: ['#FCEEF5', '#F6C7DD', '#D99AC5']
  },
  {
    name: 'Sand',
    hair: '#3C2C23',
    hairShadow: '#2A1E18',
    clothing: '#8B6D4A',
    clothingShadow: '#6F583C',
    clothingDetail: '#E4C9A6',
    accessory: '#C59D6B',
    background: ['#FFF3E1', '#F5D5B2', '#E8B98A']
  }
];

@Injectable({ providedIn: 'root' })
export class AvatarGeneratorService {
  generate(seed: string, overrides: Partial<Traits> = {}): { svg: string; traits: Traits } {
    const rng = createSeededRng(seed || 'avatar');
    const baseTraits: Traits = {
      headShape: pickIndex(rng, headShapes.length),
      skinTone: pickIndex(rng, SKIN_TONES.length),
      ears: pickIndex(rng, earVariants.length),
      eyes: pickIndex(rng, eyeVariants.length),
      brows: pickIndex(rng, browVariants.length),
      nose: pickIndex(rng, noseVariants.length),
      mouth: pickIndex(rng, mouthVariants.length),
      hair: pickIndex(rng, hairVariants.length),
      beard: pickIndex(rng, beardVariants.length),
      moustache: pickIndex(rng, moustacheVariants.length),
      clothing: pickIndex(rng, clothingVariants.length),
      accessory: pickIndex(rng, accessoryVariants.length),
      background: pickIndex(rng, backgroundVariants.length),
      palette: pickIndex(rng, PALETTES.length)
    };

    const traits: Traits = {
      ...baseTraits,
      ...overrides
    };

    traits.headShape = normalizeIndex(traits.headShape, headShapes.length);
    traits.skinTone = normalizeIndex(traits.skinTone, SKIN_TONES.length);
    traits.ears = normalizeIndex(traits.ears, earVariants.length);
    traits.eyes = normalizeIndex(traits.eyes, eyeVariants.length);
    traits.brows = normalizeIndex(traits.brows, browVariants.length);
    traits.nose = normalizeIndex(traits.nose, noseVariants.length);
    traits.mouth = normalizeIndex(traits.mouth, mouthVariants.length);
    traits.hair = normalizeIndex(traits.hair, hairVariants.length);
    traits.beard = normalizeIndex(traits.beard, beardVariants.length);
    traits.moustache = normalizeIndex(traits.moustache, moustacheVariants.length);
    traits.clothing = normalizeIndex(traits.clothing, clothingVariants.length);
    traits.accessory = normalizeIndex(traits.accessory, accessoryVariants.length);
    traits.background = normalizeIndex(traits.background, backgroundVariants.length);
    traits.palette = normalizeIndex(traits.palette, PALETTES.length);

    const svg = this.buildSvg(seed, traits);
    return { svg, traits };
  }

  randomSeed(): string {
    if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
      const values = new Uint32Array(2);
      crypto.getRandomValues(values);
      return `${values[0].toString(36)}${values[1].toString(36)}`;
    }
    return Math.random().toString(36).slice(2, 10);
  }

  async exportPng(svg: string, size: number): Promise<Blob> {
    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const image = new Image();
    image.decoding = 'async';

    const loaded = new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('Failed to load SVG'));
    });

    image.src = url;
    await loaded;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    if (!context) {
      URL.revokeObjectURL(url);
      throw new Error('Canvas not supported');
    }

    context.clearRect(0, 0, size, size);
    context.drawImage(image, 0, 0, size, size);

    URL.revokeObjectURL(url);

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('PNG export failed'));
        }
      }, 'image/png');
    });
  }

  private buildSvg(seed: string, traits: Traits): string {
    const palette = PALETTES[traits.palette];
    const skin = SKIN_TONES[traits.skinTone];
    const ids = this.buildIds(seed);

    const colors: SvgColors = {
      skin: skin.skin,
      skinShadow: skin.shadow,
      skinHighlight: skin.highlight,
      line: '#2B2B2B',
      eye: '#1F2937',
      iris: '#3B4F6B',
      brow: palette.hairShadow,
      lip: '#8F4B4B',
      hair: palette.hair,
      hairShadow: palette.hairShadow,
      clothing: palette.clothing,
      clothingShadow: palette.clothingShadow,
      clothingDetail: palette.clothingDetail,
      accessory: palette.accessory,
      background: {
        primary: palette.background[0],
        secondary: palette.background[1],
        accent: palette.background[2]
      }
    };

    const background = backgroundVariants[traits.background](colors, ids);

    const defs = `
      <defs>
        ${background.defs}
        <filter id="${ids.softShadow}" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#1f2937" flood-opacity="0.18" />
        </filter>
      </defs>
    `;

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="Avatar">
        ${defs}
        ${background.body}
        <g transform="translate(0 12)">
          ${renderClothing(traits.clothing, colors)}
          ${renderHead(traits.headShape, traits.ears, colors, ids)}
          ${renderHair(traits.hair, colors)}
          ${renderEyes(traits.eyes, traits.brows, colors)}
          ${renderNose(traits.nose, colors)}
          ${renderMoustache(traits.moustache, colors)}
          ${renderMouth(traits.mouth, colors)}
          ${renderBeard(traits.beard, colors)}
          ${renderAccessories(traits.accessory, colors)}
        </g>
      </svg>
    `.trim();
  }

  private buildIds(seed: string): SvgIds {
    const safe = hashString(seed || 'avatar').toString(36);
    return {
      seed: safe,
      shadow: `shadow-${safe}`,
      softShadow: `soft-shadow-${safe}`,
      backgroundGradient: `bg-grad-${safe}`,
      backgroundPattern: `bg-pattern-${safe}`
    };
  }
}
