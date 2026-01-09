import { EnvironmentSetting } from '../interfaces/game.interface.js';

export interface EnvironmentPreset extends EnvironmentSetting {
  prompt: string;
  classArchetypes: string[];
  objectArchetypes: string[];
}

export const ENVIRONMENT_PRESETS: Record<string, EnvironmentPreset> = {
  fantasy: {
    id: 'fantasy',
    name: 'Fantasia',
    description: 'Reinos magicos, criaturas miticas y hechizos antiguos.',
    prompt: 'Alta fantasia epica: magia real, deidades, criaturas miticas y politica feudal. Evita tecnologia moderna.',
    classArchetypes: ['Guerrero', 'Mago', 'Arquero', 'Picaro', 'Clerigo', 'Druida', 'Paladin'],
    objectArchetypes: ['espadas', 'arcos', 'armaduras', 'pergaminos', 'pociones', 'reliquias', 'mapas antiguos']
  },
  realistic: {
    id: 'realistic',
    name: 'Realista',
    description: 'Sin magia, decisiones humanas y consecuencias reales.',
    prompt: 'Realismo estricto: no hay magia ni tecnologia imposible. Consecuencias fisicas y sociales creibles.',
    classArchetypes: ['Soldado', 'Investigador', 'Medico', 'Explorador', 'Guardia', 'Contrabandista'],
    objectArchetypes: ['armas convencionales', 'botiquines', 'documentos', 'radios', 'linternas', 'llaves']
  },
  contemporary: {
    id: 'contemporary',
    name: 'Contemporaneo',
    description: 'Ciudades actuales, tecnologia moderna y conflictos urbanos.',
    prompt: 'Mundo actual urbano: tecnologia moderna, crimen organizado, corporaciones y conflictos sociales. Sin magia.',
    classArchetypes: ['Hacker', 'Agente', 'Investigador', 'Piloto', 'Mecanico', 'Periodista'],
    objectArchetypes: ['smartphones', 'laptops', 'tarjetas de acceso', 'drones', 'vehiculos', 'dinero digital']
  },
  'sci-fi': {
    id: 'sci-fi',
    name: 'Ciencia Ficcion',
    description: 'Naves, IA y fronteras del espacio profundo.',
    prompt: 'Futuro avanzado: IA, viajes espaciales, implantes y megacorporaciones. Tecnologia domina la vida diaria.',
    classArchetypes: ['Piloto', 'Ingeniero', 'Hacker', 'Soldado espacial', 'Medico de a bordo'],
    objectArchetypes: ['rifles de plasma', 'implantes', 'nanobots', 'modulos de nave', 'data chips', 'trajes presurizados']
  },
  'post-apocalyptic': {
    id: 'post-apocalyptic',
    name: 'Postapocaliptico',
    description: 'Ruinas, supervivencia y facciones emergentes.',
    prompt: 'Mundo devastado: recursos escasos, infraestructura colapsada y facciones rivales. Tecnologia reciclada.',
    classArchetypes: ['Superviviente', 'Saqueador', 'Mecanico', 'Tirador', 'Medico de campo'],
    objectArchetypes: ['chatarra', 'filtros de agua', 'municion', 'comida enlatada', 'radios rotas', 'mapas gastados']
  }
};

const mergeEnvironment = (base: EnvironmentSetting, preset: EnvironmentPreset): EnvironmentSetting => ({
  ...preset,
  ...base,
  name: base.name || preset.name,
  description: base.description || preset.description,
  prompt: base.prompt || preset.prompt,
  classArchetypes: base.classArchetypes || preset.classArchetypes,
  objectArchetypes: base.objectArchetypes || preset.objectArchetypes
});

export const resolveEnvironment = (environment?: EnvironmentSetting | string): EnvironmentSetting | undefined => {
  if (!environment) return undefined;

  const base: EnvironmentSetting =
    typeof environment === 'string'
      ? { id: environment, name: environment, description: '' }
      : environment;

  const preset = ENVIRONMENT_PRESETS[base.id];
  if (!preset) return base;

  return mergeEnvironment(base, preset);
};
