export interface GameState {
    character: Character;
    location: string;
    narrativeHistory: ChatMessage[];
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
}
