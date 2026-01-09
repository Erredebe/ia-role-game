import { Injectable } from '@angular/core';
import { AvatarConfig } from '../interfaces/avatar';

@Injectable({ providedIn: 'root' })
export class AvatarService {
  renderAvatarSvg(config: AvatarConfig): string {
    const seed = this.buildSeed(config);
    const hash = this.hashString(seed);
    const primaryHue = hash % 360;
    const accentHue = (primaryHue + 45) % 360;
    const eyeOffset = (hash % 6) - 3;
    const skinTone = this.resolveSkinTone(config.skinTone, primaryHue);
    const eyeColor = this.resolveEyeColor(config.eyeColor, primaryHue);
    const hairColor = this.resolveHairColor(config.hairStyle, primaryHue);
    const hair = this.renderHair(config.hairStyle, hairColor);
    const mouth = this.renderMouth(config.mouthStyle, primaryHue);
    const outfit = this.renderOutfit(config.outfit, accentHue);
    const accessory = this.renderAccessories(config, hash);

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label="Avatar">
        <defs>
          <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stop-color="hsl(${primaryHue}, 45%, 28%)" />
            <stop offset="100%" stop-color="hsl(${accentHue}, 55%, 20%)" />
          </linearGradient>
        </defs>
        <rect width="120" height="120" rx="60" fill="url(#bg)" />
        ${hair}
        <circle cx="60" cy="62" r="34" fill="${skinTone}" />
        <circle cx="${48 + eyeOffset}" cy="58" r="5" fill="${eyeColor}" />
        <circle cx="${72 + eyeOffset}" cy="58" r="5" fill="${eyeColor}" />
        ${mouth}
        ${outfit}
        ${accessory}
      </svg>
    `.trim();
  }

  private buildSeed(config: AvatarConfig): string {
    return [
      config.seed,
      config.name,
      config.classId,
      config.environmentId,
      config.skinTone,
      config.hairStyle,
      config.eyeColor,
      config.mouthStyle,
      config.outfit,
      config.accessories?.join(',')
    ]
      .filter(Boolean)
      .join('|') || 'avatar';
  }

  private renderAccessories(config: AvatarConfig, hash: number): string {
    const classAccessory = this.renderClassAccessory(config.classId, hash);
    const customAccessories = this.renderCustomAccessories(config.accessories ?? []);
    return `${classAccessory}${customAccessories}`;
  }

  private renderClassAccessory(classId?: string, hash?: number): string {
    const sparkleOffset = hash ? (hash % 6) - 3 : 0;
    switch (classId) {
      case 'mage':
        return `<circle cx="60" cy="34" r="8" fill="hsl(280, 60%, 65%)" />`;
      case 'warrior':
        return `<rect x="42" y="30" width="36" height="10" rx="5" fill="hsl(20, 45%, 55%)" />`;
      case 'archer':
        return `<path d="M42 36 Q60 20 78 36" fill="none" stroke="hsl(120, 35%, 50%)" stroke-width="6" stroke-linecap="round" />`;
      case 'rogue':
        return `<path d="M38 44 L82 44 L78 36 L42 36 Z" fill="hsl(210, 25%, 32%)" />`;
      case 'soldier':
        return `<rect x="38" y="32" width="44" height="12" rx="6" fill="hsl(110, 30%, 38%)" />`;
      case 'hacker':
        return `<rect x="40" y="30" width="40" height="14" rx="4" fill="hsl(180, 45%, 40%)" />`;
      case 'pilot':
        return `<path d="M40 40 Q60 22 80 40" fill="none" stroke="hsl(200, 50%, 60%)" stroke-width="6" stroke-linecap="round" />`;
      case 'investigator':
        return `<circle cx="${40 + sparkleOffset}" cy="34" r="4" fill="hsl(50, 70%, 65%)" /><circle cx="80" cy="34" r="4" fill="hsl(50, 70%, 65%)" />`;
      case 'medic':
        return `<rect x="54" y="26" width="12" height="24" rx="2" fill="hsl(350, 65%, 55%)" /><rect x="48" y="32" width="24" height="12" rx="2" fill="hsl(350, 65%, 55%)" />`;
      case 'mechanic':
        return `<path d="M42 34 H78" stroke="hsl(30, 55%, 55%)" stroke-width="6" stroke-linecap="round" />`;
      default:
        return '';
    }
  }

  private renderCustomAccessories(accessories: string[]): string {
    return accessories
      .map((accessory) => {
        switch (accessory) {
          case 'glasses':
            return `<circle cx="46" cy="58" r="7" fill="none" stroke="hsl(210, 20%, 70%)" stroke-width="2" />\n` +
              `<circle cx="74" cy="58" r="7" fill="none" stroke="hsl(210, 20%, 70%)" stroke-width="2" />\n` +
              `<path d="M53 58 H67" stroke="hsl(210, 20%, 70%)" stroke-width="2" />`;
          case 'earring':
            return `<circle cx="84" cy="70" r="3" fill="hsl(45, 70%, 65%)" />`;
          case 'scar':
            return `<path d="M40 70 L52 78" stroke="hsl(0, 35%, 40%)" stroke-width="2" stroke-linecap="round" />`;
          case 'mask':
            return `<rect x="42" y="68" width="36" height="12" rx="6" fill="hsl(210, 15%, 35%)" opacity="0.85" />`;
          default:
            return '';
        }
      })
      .join('');
  }

  private resolveSkinTone(skinTone: string | undefined, fallbackHue: number): string {
    const tones: Record<string, string> = {
      porcelain: 'hsl(30, 45%, 85%)',
      ivory: 'hsl(30, 38%, 78%)',
      tan: 'hsl(28, 40%, 65%)',
      umber: 'hsl(25, 35%, 52%)',
      ebony: 'hsl(25, 30%, 38%)'
    };
    return tones[skinTone ?? ''] ?? `hsl(${(fallbackHue + 12) % 360}, 42%, 70%)`;
  }

  private resolveEyeColor(eyeColor: string | undefined, fallbackHue: number): string {
    const colors: Record<string, string> = {
      brown: 'hsl(24, 35%, 30%)',
      blue: 'hsl(210, 55%, 45%)',
      green: 'hsl(140, 40%, 40%)',
      gray: 'hsl(0, 0%, 45%)',
      amber: 'hsl(40, 65%, 45%)'
    };
    return colors[eyeColor ?? ''] ?? `hsl(${fallbackHue}, 30%, 18%)`;
  }

  private resolveHairColor(hairStyle: string | undefined, fallbackHue: number): string {
    const colors: Record<string, string> = {
      short: 'hsl(25, 20%, 18%)',
      long: 'hsl(18, 25%, 22%)',
      bun: 'hsl(35, 25%, 20%)',
      mohawk: 'hsl(0, 55%, 40%)',
      shaved: 'hsl(0, 0%, 0%)'
    };
    return colors[hairStyle ?? ''] ?? `hsl(${fallbackHue}, 25%, 20%)`;
  }

  private renderHair(hairStyle: string | undefined, hairColor: string): string {
    switch (hairStyle) {
      case 'long':
        return `<path d="M26 60 Q60 24 94 60 V92 Q60 78 26 92 Z" fill="${hairColor}" opacity="0.9" />`;
      case 'bun':
        return `<path d="M30 56 Q60 30 90 56 V70 Q60 62 30 70 Z" fill="${hairColor}" />\n` +
          `<circle cx="60" cy="32" r="10" fill="${hairColor}" />`;
      case 'mohawk':
        return `<path d="M54 20 L66 20 L72 56 L48 56 Z" fill="${hairColor}" />`;
      case 'shaved':
        return '';
      case 'short':
      default:
        return `<path d="M30 58 Q60 32 90 58 V66 Q60 54 30 66 Z" fill="${hairColor}" />`;
    }
  }

  private renderMouth(mouthStyle: string | undefined, fallbackHue: number): string {
    const stroke = `hsl(${fallbackHue}, 28%, 24%)`;
    switch (mouthStyle) {
      case 'smile':
        return `<path d="M44 74 Q60 82 76 74" fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round" />`;
      case 'frown':
        return `<path d="M44 78 Q60 70 76 78" fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round" />`;
      case 'smirk':
        return `<path d="M46 76 Q62 78 76 70" fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round" />`;
      case 'neutral':
      default:
        return `<path d="M46 76 H74" fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round" />`;
    }
  }

  private renderOutfit(outfit: string | undefined, accentHue: number): string {
    const base = `hsl(${accentHue}, 40%, 35%)`;
    switch (outfit) {
      case 'armor':
        return `<path d="M28 100 Q60 78 92 100 V120 H28 Z" fill="${base}" />\n` +
          `<path d="M40 98 H80" stroke="hsl(${accentHue}, 35%, 55%)" stroke-width="4" />`;
      case 'cloak':
        return `<path d="M24 98 Q60 70 96 98 V120 H24 Z" fill="hsl(${accentHue}, 45%, 28%)" />`;
      case 'jacket':
        return `<path d="M30 102 Q60 84 90 102 V120 H30 Z" fill="hsl(${accentHue}, 35%, 38%)" />\n` +
          `<path d="M60 92 V120" stroke="hsl(${accentHue}, 55%, 60%)" stroke-width="3" />`;
      case 'robe':
        return `<path d="M26 104 Q60 76 94 104 V120 H26 Z" fill="hsl(${accentHue}, 30%, 30%)" />`;
      case 'tunic':
      default:
        return `<path d="M32 104 Q60 86 88 104 V120 H32 Z" fill="${base}" />`;
    }
  }

  private hashString(value: string): number {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }
}
