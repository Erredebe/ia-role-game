export type Rng = () => number;

const normalizeSeed = (seed: string): string => seed.trim() || 'avatar';

export const hashString = (value: string): number => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

export const createSeededRng = (seed: string): Rng => {
  let state = hashString(normalizeSeed(seed));
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const pickIndex = (rng: Rng, max: number): number => Math.floor(rng() * max);

export const normalizeIndex = (value: number, max: number): number => {
  if (!Number.isFinite(value) || max <= 0) {
    return 0;
  }
  const safe = Math.floor(value);
  return ((safe % max) + max) % max;
};
