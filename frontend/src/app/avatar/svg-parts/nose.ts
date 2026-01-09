import { SvgColors } from './types';

export const noseVariants = [
  (colors: SvgColors): string => `
    <path d="M256 224 C246 252 246 270 256 286 C266 270 266 252 256 224 Z" fill="${colors.skinShadow}" stroke="${colors.line}" stroke-width="3" vector-effect="non-scaling-stroke" />
  `,
  (colors: SvgColors): string => `
    <path d="M252 224 C242 256 240 278 256 292 C272 278 270 256 260 224" fill="none" stroke="${colors.line}" stroke-width="4" stroke-linecap="round" vector-effect="non-scaling-stroke" />
  `,
  (colors: SvgColors): string => `
    <path d="M256 230 L248 278 Q256 286 264 278 Z" fill="${colors.skinShadow}" stroke="${colors.line}" stroke-width="3" vector-effect="non-scaling-stroke" />
  `,
  (colors: SvgColors): string => `
    <path d="M250 238 C244 260 244 276 256 288 C268 276 268 260 262 238" fill="${colors.skinShadow}" stroke="${colors.line}" stroke-width="3" vector-effect="non-scaling-stroke" />
  `
];

export const renderNose = (noseIndex: number, colors: SvgColors): string => {
  const nose = noseVariants[noseIndex] ?? noseVariants[0];
  return `<g>${nose(colors)}</g>`;
};
