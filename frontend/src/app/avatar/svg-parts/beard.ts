import { SvgColors } from './types';

export const beardVariants = [
  () => '',
  (colors: SvgColors): string => `
    <path d="M182 308 Q256 370 330 308 L320 356 Q256 396 192 356 Z" fill="${colors.hairShadow}" opacity="0.85" />
  `,
  (colors: SvgColors): string => `
    <path d="M194 318 Q256 360 318 318 L308 350 Q256 380 204 350 Z" fill="${colors.hairShadow}" opacity="0.85" />
  `,
  (colors: SvgColors): string => `
    <path d="M188 312 Q256 350 324 312 L314 340 Q256 368 198 340 Z" fill="${colors.hairShadow}" opacity="0.85" />
  `,
  (colors: SvgColors): string => `
    <path d="M182 320 Q256 356 330 320 L320 342 Q256 366 192 342 Z" fill="${colors.hairShadow}" opacity="0.85" />
  `,
  (colors: SvgColors): string => `
    <path d="M196 318 Q256 350 316 318 L308 332 Q256 350 204 332 Z" fill="${colors.hairShadow}" opacity="0.85" />
  `
];

export const renderBeard = (beardIndex: number, colors: SvgColors): string => {
  const beard = beardVariants[beardIndex] ?? beardVariants[0];
  return `<g>${beard(colors)}</g>`;
};
