import { SvgColors } from './types';

export const mouthVariants = [
  (colors: SvgColors): string => `
    <path d="M206 316 Q256 336 306 316" fill="none" stroke="${colors.lip}" stroke-width="6" stroke-linecap="round" vector-effect="non-scaling-stroke" />
  `,
  (colors: SvgColors): string => `
    <path d="M210 320 Q256 300 302 320" fill="none" stroke="${colors.lip}" stroke-width="6" stroke-linecap="round" vector-effect="non-scaling-stroke" />
  `,
  (colors: SvgColors): string => `
    <path d="M214 322 H298" fill="none" stroke="${colors.lip}" stroke-width="6" stroke-linecap="round" vector-effect="non-scaling-stroke" />
  `,
  (colors: SvgColors): string => `
    <path d="M216 320 Q256 340 296 320" fill="${colors.lip}" opacity="0.4" />
    <path d="M216 320 Q256 340 296 320" fill="none" stroke="${colors.lip}" stroke-width="5" stroke-linecap="round" vector-effect="non-scaling-stroke" />
  `,
  (colors: SvgColors): string => `
    <path d="M214 324 Q256 332 298 324" fill="none" stroke="${colors.lip}" stroke-width="5" stroke-linecap="round" vector-effect="non-scaling-stroke" />
    <path d="M226 330 Q256 338 286 330" fill="none" stroke="${colors.lip}" stroke-width="4" stroke-linecap="round" vector-effect="non-scaling-stroke" />
  `,
  (colors: SvgColors): string => `
    <path d="M214 318 Q256 328 298 318" fill="none" stroke="${colors.lip}" stroke-width="6" stroke-linecap="round" vector-effect="non-scaling-stroke" />
    <circle cx="256" cy="324" r="3" fill="${colors.lip}" />
  `,
  (colors: SvgColors): string => `
    <path d="M218 322 Q256 312 294 322" fill="none" stroke="${colors.lip}" stroke-width="6" stroke-linecap="round" vector-effect="non-scaling-stroke" />
    <path d="M222 328 Q256 336 290 328" fill="none" stroke="${colors.lip}" stroke-width="4" stroke-linecap="round" vector-effect="non-scaling-stroke" />
  `,
  (colors: SvgColors): string => `
    <path d="M220 324 Q256 346 292 324" fill="${colors.lip}" opacity="0.35" />
    <path d="M220 324 Q256 346 292 324" fill="none" stroke="${colors.lip}" stroke-width="5" stroke-linecap="round" vector-effect="non-scaling-stroke" />
  `
];

export const renderMouth = (mouthIndex: number, colors: SvgColors): string => {
  const mouth = mouthVariants[mouthIndex] ?? mouthVariants[0];
  return `<g>${mouth(colors)}</g>`;
};
