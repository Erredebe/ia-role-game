import { SvgColors } from './types';

export const eyeVariants = [
  (colors: SvgColors): string => `
    <g>
      <ellipse cx="204" cy="218" rx="26" ry="18" fill="#fff" stroke="${colors.line}" stroke-width="3" vector-effect="non-scaling-stroke" />
      <circle cx="204" cy="220" r="9" fill="${colors.iris}" />
      <circle cx="208" cy="216" r="3" fill="#fff" />
    </g>
    <g>
      <ellipse cx="308" cy="218" rx="26" ry="18" fill="#fff" stroke="${colors.line}" stroke-width="3" vector-effect="non-scaling-stroke" />
      <circle cx="308" cy="220" r="9" fill="${colors.iris}" />
      <circle cx="312" cy="216" r="3" fill="#fff" />
    </g>
  `,
  (colors: SvgColors): string => `
    <g>
      <rect x="182" y="206" width="44" height="24" rx="12" fill="#fff" stroke="${colors.line}" stroke-width="3" vector-effect="non-scaling-stroke" />
      <circle cx="204" cy="218" r="8" fill="${colors.iris}" />
    </g>
    <g>
      <rect x="286" y="206" width="44" height="24" rx="12" fill="#fff" stroke="${colors.line}" stroke-width="3" vector-effect="non-scaling-stroke" />
      <circle cx="308" cy="218" r="8" fill="${colors.iris}" />
    </g>
  `,
  (colors: SvgColors): string => `
    <g>
      <ellipse cx="204" cy="222" rx="24" ry="14" fill="#fff" stroke="${colors.line}" stroke-width="3" vector-effect="non-scaling-stroke" />
      <circle cx="204" cy="222" r="7" fill="${colors.iris}" />
    </g>
    <g>
      <ellipse cx="308" cy="222" rx="24" ry="14" fill="#fff" stroke="${colors.line}" stroke-width="3" vector-effect="non-scaling-stroke" />
      <circle cx="308" cy="222" r="7" fill="${colors.iris}" />
    </g>
  `,
  (colors: SvgColors): string => `
    <g>
      <path d="M178 220 Q204 198 230 220 Q204 230 178 220 Z" fill="#fff" stroke="${colors.line}" stroke-width="3" vector-effect="non-scaling-stroke" />
      <circle cx="204" cy="218" r="7" fill="${colors.iris}" />
    </g>
    <g>
      <path d="M282 220 Q308 198 334 220 Q308 230 282 220 Z" fill="#fff" stroke="${colors.line}" stroke-width="3" vector-effect="non-scaling-stroke" />
      <circle cx="308" cy="218" r="7" fill="${colors.iris}" />
    </g>
  `,
  (colors: SvgColors): string => `
    <g>
      <ellipse cx="204" cy="222" rx="22" ry="10" fill="#fff" stroke="${colors.line}" stroke-width="3" vector-effect="non-scaling-stroke" />
      <circle cx="204" cy="222" r="6" fill="${colors.iris}" />
    </g>
    <g>
      <ellipse cx="308" cy="222" rx="22" ry="10" fill="#fff" stroke="${colors.line}" stroke-width="3" vector-effect="non-scaling-stroke" />
      <circle cx="308" cy="222" r="6" fill="${colors.iris}" />
    </g>
  `,
  (colors: SvgColors): string => `
    <g>
      <path d="M178 220 Q204 210 230 220" fill="none" stroke="${colors.line}" stroke-width="4" stroke-linecap="round" vector-effect="non-scaling-stroke" />
      <circle cx="204" cy="224" r="6" fill="${colors.iris}" />
    </g>
    <g>
      <path d="M282 220 Q308 210 334 220" fill="none" stroke="${colors.line}" stroke-width="4" stroke-linecap="round" vector-effect="non-scaling-stroke" />
      <circle cx="308" cy="224" r="6" fill="${colors.iris}" />
    </g>
  `,
  (colors: SvgColors): string => `
    <g>
      <rect x="182" y="212" width="44" height="20" rx="10" fill="#fff" stroke="${colors.line}" stroke-width="3" vector-effect="non-scaling-stroke" />
      <circle cx="204" cy="222" r="5" fill="${colors.iris}" />
    </g>
    <g>
      <rect x="286" y="212" width="44" height="20" rx="10" fill="#fff" stroke="${colors.line}" stroke-width="3" vector-effect="non-scaling-stroke" />
      <circle cx="308" cy="222" r="5" fill="${colors.iris}" />
    </g>
  `,
  (colors: SvgColors): string => `
    <g>
      <ellipse cx="204" cy="218" rx="24" ry="16" fill="#fff" stroke="${colors.line}" stroke-width="3" vector-effect="non-scaling-stroke" />
      <circle cx="204" cy="218" r="8" fill="${colors.iris}" />
      <circle cx="210" cy="214" r="3" fill="#fff" />
    </g>
    <g>
      <ellipse cx="308" cy="218" rx="24" ry="16" fill="#fff" stroke="${colors.line}" stroke-width="3" vector-effect="non-scaling-stroke" />
      <circle cx="308" cy="218" r="8" fill="${colors.iris}" />
      <circle cx="314" cy="214" r="3" fill="#fff" />
    </g>
  `
];

export const browVariants = [
  (colors: SvgColors): string => `
    <path d="M176 196 Q204 184 232 196" fill="none" stroke="${colors.brow}" stroke-width="5" stroke-linecap="round" vector-effect="non-scaling-stroke" />
    <path d="M280 196 Q308 184 336 196" fill="none" stroke="${colors.brow}" stroke-width="5" stroke-linecap="round" vector-effect="non-scaling-stroke" />
  `,
  (colors: SvgColors): string => `
    <path d="M176 202 Q204 192 232 188" fill="none" stroke="${colors.brow}" stroke-width="5" stroke-linecap="round" vector-effect="non-scaling-stroke" />
    <path d="M280 188 Q308 192 336 202" fill="none" stroke="${colors.brow}" stroke-width="5" stroke-linecap="round" vector-effect="non-scaling-stroke" />
  `,
  (colors: SvgColors): string => `
    <path d="M174 196 H234" fill="none" stroke="${colors.brow}" stroke-width="5" stroke-linecap="round" vector-effect="non-scaling-stroke" />
    <path d="M278 196 H338" fill="none" stroke="${colors.brow}" stroke-width="5" stroke-linecap="round" vector-effect="non-scaling-stroke" />
  `,
  (colors: SvgColors): string => `
    <path d="M178 190 Q204 200 232 190" fill="none" stroke="${colors.brow}" stroke-width="5" stroke-linecap="round" vector-effect="non-scaling-stroke" />
    <path d="M282 190 Q308 200 336 190" fill="none" stroke="${colors.brow}" stroke-width="5" stroke-linecap="round" vector-effect="non-scaling-stroke" />
  `,
  (colors: SvgColors): string => `
    <path d="M176 194 Q200 178 236 188" fill="none" stroke="${colors.brow}" stroke-width="5" stroke-linecap="round" vector-effect="non-scaling-stroke" />
    <path d="M276 188 Q312 178 336 194" fill="none" stroke="${colors.brow}" stroke-width="5" stroke-linecap="round" vector-effect="non-scaling-stroke" />
  `,
  (colors: SvgColors): string => `
    <path d="M176 196 Q204 188 232 198" fill="none" stroke="${colors.brow}" stroke-width="6" stroke-linecap="round" vector-effect="non-scaling-stroke" />
    <path d="M280 198 Q308 188 336 196" fill="none" stroke="${colors.brow}" stroke-width="6" stroke-linecap="round" vector-effect="non-scaling-stroke" />
  `
];

export const renderEyes = (eyeIndex: number, browIndex: number, colors: SvgColors): string => {
  const eyes = eyeVariants[eyeIndex] ?? eyeVariants[0];
  const brows = browVariants[browIndex] ?? browVariants[0];
  return `
    <g>
      ${brows(colors)}
      ${eyes(colors)}
    </g>
  `;
};
