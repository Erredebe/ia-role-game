export interface Traits {
  headShape: number;
  skinTone: number;
  ears: number;
  eyes: number;
  brows: number;
  nose: number;
  mouth: number;
  hair: number;
  beard: number;
  moustache: number;
  clothing: number;
  accessory: number;
  background: number;
  palette: number;
}

export type TraitKey = keyof Traits;

export const TRAIT_LABELS: Record<TraitKey, string> = {
  headShape: 'Forma de cabeza',
  skinTone: 'Tono de piel',
  ears: 'Orejas',
  eyes: 'Ojos',
  brows: 'Cejas',
  nose: 'Nariz',
  mouth: 'Boca',
  hair: 'Peinado',
  beard: 'Barba',
  moustache: 'Bigote',
  clothing: 'Ropa',
  accessory: 'Accesorio',
  background: 'Fondo',
  palette: 'Paleta'
};
