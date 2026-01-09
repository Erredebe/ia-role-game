import { SvgColors, SvgIds } from './types';

export interface BackgroundRenderResult {
  defs: string;
  body: string;
}

const baseRect = (fill: string): string => `<rect width="512" height="512" rx="96" fill="${fill}" />`;

const linearGradient = (ids: SvgIds, colors: SvgColors): string => `
  <linearGradient id="${ids.backgroundGradient}" x1="0" x2="1" y1="0" y2="1">
    <stop offset="0%" stop-color="${colors.background.primary}" />
    <stop offset="100%" stop-color="${colors.background.secondary}" />
  </linearGradient>
`;

const radialGradient = (ids: SvgIds, colors: SvgColors): string => `
  <radialGradient id="${ids.backgroundGradient}" cx="0.3" cy="0.2" r="0.8">
    <stop offset="0%" stop-color="${colors.background.secondary}" />
    <stop offset="100%" stop-color="${colors.background.primary}" />
  </radialGradient>
`;

const dotPattern = (ids: SvgIds, colors: SvgColors): string => `
  <pattern id="${ids.backgroundPattern}" width="28" height="28" patternUnits="userSpaceOnUse">
    <circle cx="8" cy="8" r="3" fill="${colors.background.accent}" opacity="0.35" />
    <circle cx="20" cy="20" r="3" fill="${colors.background.accent}" opacity="0.25" />
  </pattern>
`;

const stripePattern = (ids: SvgIds, colors: SvgColors): string => `
  <pattern id="${ids.backgroundPattern}" width="32" height="32" patternUnits="userSpaceOnUse" patternTransform="rotate(25)">
    <rect width="32" height="14" fill="${colors.background.secondary}" opacity="0.2" />
    <rect y="18" width="32" height="14" fill="${colors.background.accent}" opacity="0.15" />
  </pattern>
`;

export const backgroundVariants = [
  (colors: SvgColors, ids: SvgIds): BackgroundRenderResult => ({
    defs: '',
    body: baseRect(colors.background.primary)
  }),
  (colors: SvgColors, ids: SvgIds): BackgroundRenderResult => ({
    defs: linearGradient(ids, colors),
    body: baseRect(`url(#${ids.backgroundGradient})`)
  }),
  (colors: SvgColors, ids: SvgIds): BackgroundRenderResult => ({
    defs: radialGradient(ids, colors),
    body: baseRect(`url(#${ids.backgroundGradient})`)
  }),
  (colors: SvgColors, ids: SvgIds): BackgroundRenderResult => ({
    defs: dotPattern(ids, colors),
    body: `${baseRect(colors.background.primary)}<rect width="512" height="512" rx="96" fill="url(#${ids.backgroundPattern})" />`
  }),
  (colors: SvgColors, ids: SvgIds): BackgroundRenderResult => ({
    defs: stripePattern(ids, colors),
    body: `${baseRect(colors.background.primary)}<rect width="512" height="512" rx="96" fill="url(#${ids.backgroundPattern})" />`
  }),
  (colors: SvgColors): BackgroundRenderResult => ({
    defs: '',
    body: `
      ${baseRect(colors.background.primary)}
      <path d="M0 320 Q256 240 512 320 V512 H0 Z" fill="${colors.background.secondary}" opacity="0.8" />
    `.trim()
  }),
  (colors: SvgColors): BackgroundRenderResult => ({
    defs: '',
    body: `
      ${baseRect(colors.background.secondary)}
      <path d="M-40 120 L520 40 L560 200 L0 280 Z" fill="${colors.background.primary}" opacity="0.9" />
    `.trim()
  }),
  (colors: SvgColors): BackgroundRenderResult => ({
    defs: '',
    body: `
      ${baseRect(colors.background.primary)}
      <circle cx="420" cy="120" r="80" fill="${colors.background.accent}" opacity="0.2" />
      <circle cx="120" cy="420" r="120" fill="${colors.background.accent}" opacity="0.18" />
    `.trim()
  }),
  (colors: SvgColors, ids: SvgIds): BackgroundRenderResult => ({
    defs: linearGradient(ids, {
      ...colors,
      background: {
        primary: colors.background.accent,
        secondary: colors.background.primary,
        accent: colors.background.secondary
      }
    }),
    body: baseRect(`url(#${ids.backgroundGradient})`)
  }),
  (colors: SvgColors): BackgroundRenderResult => ({
    defs: '',
    body: `
      ${baseRect(colors.background.secondary)}
      <path d="M0 120 Q180 80 320 140 T512 120 V0 H0 Z" fill="${colors.background.primary}" opacity="0.75" />
    `.trim()
  })
];
