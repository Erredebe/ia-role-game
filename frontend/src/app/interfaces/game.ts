export interface GameState {
    character: Character;
    location: string;
    narrativeHistory: ChatMessage[];
    environment?: EnvironmentSetting;
}

export interface Character {
    name: string;
    class: string;
    hp: number;
    maxHp: number;
    mana: number;
    maxMana: number;
    avatarSeed?: string;
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

export interface ActionResponse {
    narrative: string;
    suggestedActions: string[];
    gameState: GameState;
}
