import { SvgColors, SvgIds } from './types';

export const headShapes = [
  (colors: SvgColors): string => `
    <ellipse cx="256" cy="214" rx="118" ry="148" fill="${colors.skin}" stroke="${colors.line}" stroke-width="4" vector-effect="non-scaling-stroke" />
  `,
  (colors: SvgColors): string => `
    <rect x="140" y="84" width="232" height="260" rx="92" fill="${colors.skin}" stroke="${colors.line}" stroke-width="4" vector-effect="non-scaling-stroke" />
  `,
  (colors: SvgColors): string => `
    <path d="M256 86 C188 86 142 132 138 202 C134 278 178 344 256 348 C334 344 378 278 374 202 C370 132 324 86 256 86 Z" fill="${colors.skin}" stroke="${colors.line}" stroke-width="4" vector-effect="non-scaling-stroke" />
  `,
  (colors: SvgColors): string => `
    <path d="M256 92 C196 92 150 136 150 196 C150 266 204 336 256 360 C308 336 362 266 362 196 C362 136 316 92 256 92 Z" fill="${colors.skin}" stroke="${colors.line}" stroke-width="4" vector-effect="non-scaling-stroke" />
  `,
  (colors: SvgColors): string => `
    <rect x="150" y="90" width="212" height="250" rx="60" fill="${colors.skin}" stroke="${colors.line}" stroke-width="4" vector-effect="non-scaling-stroke" />
  `,
  (colors: SvgColors): string => `
    <path d="M256 80 C178 84 130 148 132 226 C134 304 198 354 256 354 C314 354 378 304 380 226 C382 148 334 84 256 80 Z" fill="${colors.skin}" stroke="${colors.line}" stroke-width="4" vector-effect="non-scaling-stroke" />
  `
];

export const earVariants = [
  (colors: SvgColors): string => `
    <ellipse cx="132" cy="218" rx="26" ry="40" fill="${colors.skinShadow}" stroke="${colors.line}" stroke-width="3" vector-effect="non-scaling-stroke" />
    <ellipse cx="380" cy="218" rx="26" ry="40" fill="${colors.skinShadow}" stroke="${colors.line}" stroke-width="3" vector-effect="non-scaling-stroke" />
  `,
  (colors: SvgColors): string => `
    <path d="M124 210 C112 218 112 250 132 262 C148 270 156 250 154 230 C152 212 136 204 124 210 Z" fill="${colors.skinShadow}" stroke="${colors.line}" stroke-width="3" vector-effect="non-scaling-stroke" />
    <path d="M388 210 C400 218 400 250 380 262 C364 270 356 250 358 230 C360 212 376 204 388 210 Z" fill="${colors.skinShadow}" stroke="${colors.line}" stroke-width="3" vector-effect="non-scaling-stroke" />
  `,
  (colors: SvgColors): string => `
    <ellipse cx="128" cy="222" rx="22" ry="34" fill="${colors.skinShadow}" stroke="${colors.line}" stroke-width="3" vector-effect="non-scaling-stroke" />
    <ellipse cx="384" cy="222" rx="22" ry="34" fill="${colors.skinShadow}" stroke="${colors.line}" stroke-width="3" vector-effect="non-scaling-stroke" />
  `
];

export const renderHead = (shapeIndex: number, earIndex: number, colors: SvgColors, ids: SvgIds): string => {
  const shape = headShapes[shapeIndex] ?? headShapes[0];
  const ears = earVariants[earIndex] ?? earVariants[0];
  return `
    <g filter="url(#${ids.softShadow})">
      ${ears(colors)}
      ${shape(colors)}
      <path d="M182 270 C200 316 228 344 256 344 C284 344 312 316 330 270" fill="none" stroke="${colors.skinHighlight}" stroke-width="12" stroke-linecap="round" opacity="0.35" />
    </g>
    <rect x="216" y="330" width="80" height="70" rx="30" fill="${colors.skinShadow}" stroke="${colors.line}" stroke-width="4" vector-effect="non-scaling-stroke" />
  `;
};
