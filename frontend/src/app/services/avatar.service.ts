import { Injectable } from '@angular/core';
import { AvatarConfig } from '../interfaces/avatar';

@Injectable({ providedIn: 'root' })
export class AvatarService {
  renderAvatarSvg(config: AvatarConfig): string {
    const seed = this.buildSeed(config);
    const hash = this.hashString(seed);
    const primaryHue = hash % 360;
    const accentHue = (primaryHue + 45) % 360;
    const faceHue = (primaryHue + 15) % 360;
    const eyeOffset = (hash % 6) - 3;
    const mouthCurve = (hash % 8) - 4;
    const accessory = this.renderAccessory(config.classId, hash);

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label="Avatar">
        <defs>
          <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stop-color="hsl(${primaryHue}, 45%, 28%)" />
            <stop offset="100%" stop-color="hsl(${accentHue}, 55%, 20%)" />
          </linearGradient>
        </defs>
        <rect width="120" height="120" rx="60" fill="url(#bg)" />
        <circle cx="60" cy="62" r="34" fill="hsl(${faceHue}, 42%, 70%)" />
        <circle cx="${48 + eyeOffset}" cy="58" r="5" fill="hsl(${primaryHue}, 30%, 18%)" />
        <circle cx="${72 + eyeOffset}" cy="58" r="5" fill="hsl(${primaryHue}, 30%, 18%)" />
        <path d="M45 74 Q60 ${78 + mouthCurve} 75 74" fill="none" stroke="hsl(${primaryHue}, 28%, 24%)" stroke-width="4" stroke-linecap="round" />
        ${accessory}
      </svg>
    `.trim();
  }

  private buildSeed(config: AvatarConfig): string {
    return [config.seed, config.name, config.classId, config.environmentId]
      .filter(Boolean)
      .join('|') || 'avatar';
  }

  private renderAccessory(classId?: string, hash?: number): string {
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

  private hashString(value: string): number {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }
}
