import { SvgColors } from './types';

export const moustacheVariants = [
  () => '',
  (colors: SvgColors): string => `
    <path d="M220 298 Q256 286 292 298" fill="none" stroke="${colors.hairShadow}" stroke-width="6" stroke-linecap="round" vector-effect="non-scaling-stroke" />
  `,
  (colors: SvgColors): string => `
    <path d="M216 296 Q236 308 256 300 Q276 308 296 296" fill="none" stroke="${colors.hairShadow}" stroke-width="6" stroke-linecap="round" vector-effect="non-scaling-stroke" />
  `,
  (colors: SvgColors): string => `
    <path d="M224 296 Q256 310 288 296" fill="none" stroke="${colors.hairShadow}" stroke-width="6" stroke-linecap="round" vector-effect="non-scaling-stroke" />
  `
];

export const renderMoustache = (moustacheIndex: number, colors: SvgColors): string => {
  const moustache = moustacheVariants[moustacheIndex] ?? moustacheVariants[0];
  return `<g>${moustache(colors)}</g>`;
};
