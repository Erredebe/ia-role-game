export interface GameState {
    character: Character;
    location: string;
    narrativeHistory: ChatMessage[];
    environment?: EnvironmentSetting;
    narrativeSummary: string; // Resumen acumulativo de la historia
}

export interface Character {
    name: string;
    class: string;
    hp: number;
    maxHp: number;
    mana: number;
    maxMana: number;
    inventory: string[];
    stats: Stats;
}

export interface Stats {
    strength: number;
    dexterity: number;
    intelligence: number;
    luck: number;
}

export interface EnvironmentSetting {
    id: string;
    name: string;
    description: string;
}

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface GameAction {
    type: 'narrative' | 'combat' | 'check';
    description: string;
    suggestedActions?: string[];
    updatedState?: Partial<GameState>;
    updatedSummary?: string; // Nuevo resumen narrativo sugerido por la IA
}
