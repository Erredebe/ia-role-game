export interface CharacterClass {
  id: string;
  name: string;
  description: string;
  icon: string;
  baseHp: number;
  baseMana: number;
  allowedEnvironments: string[];
}

export interface EnvironmentOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  prompt: string;
  classArchetypes: string[];
  objectArchetypes: string[];
}
