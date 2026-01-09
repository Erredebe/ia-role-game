import { SvgColors } from './types';

export const hairVariants = [
  (colors: SvgColors): string => `
    <path d="M136 196 Q256 70 376 196 L372 232 Q256 150 140 232 Z" fill="${colors.hair}" stroke="${colors.line}" stroke-width="4" vector-effect="non-scaling-stroke" />
  `,
  (colors: SvgColors): string => `
    <path d="M150 190 Q256 60 362 190 V240 Q256 160 150 240 Z" fill="${colors.hair}" stroke="${colors.line}" stroke-width="4" vector-effect="non-scaling-stroke" />
    <circle cx="312" cy="118" r="30" fill="${colors.hair}" />
  `,
  (colors: SvgColors): string => `
    <path d="M144 200 Q256 80 368 200 L356 266 Q256 200 156 266 Z" fill="${colors.hair}" stroke="${colors.line}" stroke-width="4" vector-effect="non-scaling-stroke" />
  `,
  (colors: SvgColors): string => `
    <path d="M162 180 Q256 86 350 180 L352 210 Q256 142 160 210 Z" fill="${colors.hair}" stroke="${colors.line}" stroke-width="4" vector-effect="non-scaling-stroke" />
  `,
  (colors: SvgColors): string => `
    <path d="M138 220 Q256 60 374 220 L370 256 Q256 190 142 256 Z" fill="${colors.hair}" stroke="${colors.line}" stroke-width="4" vector-effect="non-scaling-stroke" />
    <path d="M152 180 Q200 120 248 180" fill="none" stroke="${colors.hairShadow}" stroke-width="6" stroke-linecap="round" vector-effect="non-scaling-stroke" />
  `,
  (colors: SvgColors): string => `
    <path d="M140 200 Q256 100 372 200 V240 Q256 170 140 240 Z" fill="${colors.hair}" stroke="${colors.line}" stroke-width="4" vector-effect="non-scaling-stroke" />
    <path d="M176 210 Q256 150 336 210" fill="none" stroke="${colors.hairShadow}" stroke-width="5" stroke-linecap="round" vector-effect="non-scaling-stroke" />
  `,
  (colors: SvgColors): string => `
    <path d="M160 186 Q256 70 352 186 V238 Q256 170 160 238 Z" fill="${colors.hair}" stroke="${colors.line}" stroke-width="4" vector-effect="non-scaling-stroke" />
    <path d="M188 168 Q256 120 324 168" fill="none" stroke="${colors.hairShadow}" stroke-width="6" stroke-linecap="round" vector-effect="non-scaling-stroke" />
  `,
  (colors: SvgColors): string => `
    <path d="M150 200 Q256 110 362 200 V248 Q256 190 150 248 Z" fill="${colors.hair}" stroke="${colors.line}" stroke-width="4" vector-effect="non-scaling-stroke" />
    <path d="M166 196 Q256 140 346 196" fill="none" stroke="${colors.hairShadow}" stroke-width="5" stroke-linecap="round" vector-effect="non-scaling-stroke" />
  `,
  (colors: SvgColors): string => `
    <path d="M136 210 Q256 90 376 210 L368 276 Q256 210 144 276 Z" fill="${colors.hair}" stroke="${colors.line}" stroke-width="4" vector-effect="non-scaling-stroke" />
    <circle cx="190" cy="132" r="24" fill="${colors.hair}" />
  `,
  (colors: SvgColors): string => `
    <path d="M160 206 Q256 120 352 206 V242 Q256 194 160 242 Z" fill="${colors.hair}" stroke="${colors.line}" stroke-width="4" vector-effect="non-scaling-stroke" />
    <path d="M170 230 Q256 180 342 230" fill="none" stroke="${colors.hairShadow}" stroke-width="6" stroke-linecap="round" vector-effect="non-scaling-stroke" />
  `
];

export const renderHair = (hairIndex: number, colors: SvgColors): string => {
  const hair = hairVariants[hairIndex] ?? hairVariants[0];
  return `<g>${hair(colors)}</g>`;
};
