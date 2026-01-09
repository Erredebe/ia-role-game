import { SvgColors } from './types';

export const clothingVariants = [
  (colors: SvgColors): string => `
    <path d="M96 512 L128 398 Q256 340 384 398 L416 512 Z" fill="${colors.clothing}" />
    <path d="M170 410 H342" stroke="${colors.clothingDetail}" stroke-width="6" stroke-linecap="round" vector-effect="non-scaling-stroke" />
  `,
  (colors: SvgColors): string => `
    <path d="M92 512 L140 388 Q256 330 372 388 L420 512 Z" fill="${colors.clothing}" />
    <path d="M256 348 V512" stroke="${colors.clothingDetail}" stroke-width="6" vector-effect="non-scaling-stroke" />
  `,
  (colors: SvgColors): string => `
    <path d="M108 512 L136 402 Q256 350 376 402 L404 512 Z" fill="${colors.clothingShadow}" />
    <path d="M128 512 L154 410 Q256 360 358 410 L384 512 Z" fill="${colors.clothing}" />
  `,
  (colors: SvgColors): string => `
    <path d="M92 512 L132 392 Q256 330 380 392 L420 512 Z" fill="${colors.clothing}" />
    <path d="M192 372 Q256 404 320 372" fill="none" stroke="${colors.clothingDetail}" stroke-width="6" stroke-linecap="round" vector-effect="non-scaling-stroke" />
  `,
  (colors: SvgColors): string => `
    <path d="M104 512 L140 398 Q256 340 372 398 L408 512 Z" fill="${colors.clothing}" />
    <path d="M200 404 V512" stroke="${colors.clothingDetail}" stroke-width="6" vector-effect="non-scaling-stroke" />
    <path d="M312 404 V512" stroke="${colors.clothingDetail}" stroke-width="6" vector-effect="non-scaling-stroke" />
  `,
  (colors: SvgColors): string => `
    <path d="M100 512 L148 384 Q256 320 364 384 L412 512 Z" fill="${colors.clothing}" />
    <path d="M148 384 L200 512" stroke="${colors.clothingDetail}" stroke-width="6" vector-effect="non-scaling-stroke" />
    <path d="M364 384 L312 512" stroke="${colors.clothingDetail}" stroke-width="6" vector-effect="non-scaling-stroke" />
  `,
  (colors: SvgColors): string => `
    <path d="M120 512 L148 402 Q256 352 364 402 L392 512 Z" fill="${colors.clothing}" />
    <rect x="206" y="402" width="100" height="30" rx="12" fill="${colors.clothingDetail}" />
  `,
  (colors: SvgColors): string => `
    <path d="M90 512 L132 390 Q256 330 380 390 L422 512 Z" fill="${colors.clothingShadow}" />
    <path d="M118 512 L152 404 Q256 350 360 404 L394 512 Z" fill="${colors.clothing}" />
    <path d="M256 360 V512" stroke="${colors.clothingDetail}" stroke-width="5" vector-effect="non-scaling-stroke" />
  `,
  (colors: SvgColors): string => `
    <path d="M108 512 L142 394 Q256 340 370 394 L404 512 Z" fill="${colors.clothing}" />
    <path d="M180 430 Q256 470 332 430" fill="none" stroke="${colors.clothingDetail}" stroke-width="6" stroke-linecap="round" vector-effect="non-scaling-stroke" />
  `,
  (colors: SvgColors): string => `
    <path d="M100 512 L136 396 Q256 338 376 396 L412 512 Z" fill="${colors.clothing}" />
    <path d="M206 388 L256 512" stroke="${colors.clothingDetail}" stroke-width="6" vector-effect="non-scaling-stroke" />
    <path d="M306 388 L256 512" stroke="${colors.clothingDetail}" stroke-width="6" vector-effect="non-scaling-stroke" />
  `
];

export const renderClothing = (clothingIndex: number, colors: SvgColors): string => {
  const clothing = clothingVariants[clothingIndex] ?? clothingVariants[0];
  return `<g>${clothing(colors)}</g>`;
};
