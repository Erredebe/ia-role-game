import { SvgColors } from './types';

export const accessoryVariants = [
  () => '',
  (colors: SvgColors): string => `
    <g>
      <rect x="176" y="210" width="64" height="36" rx="12" fill="none" stroke="${colors.accessory}" stroke-width="5" vector-effect="non-scaling-stroke" />
      <rect x="272" y="210" width="64" height="36" rx="12" fill="none" stroke="${colors.accessory}" stroke-width="5" vector-effect="non-scaling-stroke" />
      <path d="M240 228 H272" stroke="${colors.accessory}" stroke-width="5" vector-effect="non-scaling-stroke" />
    </g>
  `,
  (colors: SvgColors): string => `
    <circle cx="360" cy="248" r="8" fill="${colors.accessory}" />
    <circle cx="152" cy="248" r="8" fill="${colors.accessory}" />
  `,
  (colors: SvgColors): string => `
    <path d="M188 270 L220 292" stroke="${colors.accessory}" stroke-width="6" stroke-linecap="round" vector-effect="non-scaling-stroke" />
  `,
  (colors: SvgColors): string => `
    <path d="M190 216 Q256 180 322 216" fill="none" stroke="${colors.accessory}" stroke-width="6" stroke-linecap="round" vector-effect="non-scaling-stroke" />
    <circle cx="256" cy="184" r="10" fill="${colors.accessory}" />
  `,
  (colors: SvgColors): string => `
    <path d="M210 332 Q256 350 302 332" fill="none" stroke="${colors.accessory}" stroke-width="5" stroke-linecap="round" vector-effect="non-scaling-stroke" />
  `,
  (colors: SvgColors): string => `
    <path d="M236 260 Q256 278 276 260" fill="none" stroke="${colors.accessory}" stroke-width="6" stroke-linecap="round" vector-effect="non-scaling-stroke" />
  `
];

export const renderAccessories = (accessoryIndex: number, colors: SvgColors): string => {
  const accessory = accessoryVariants[accessoryIndex] ?? accessoryVariants[0];
  return `<g>${accessory(colors)}</g>`;
};
