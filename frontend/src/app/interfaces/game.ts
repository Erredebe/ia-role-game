export interface GameState {
    character: Character;
    location: string;
    narrativeHistory: ChatMessage[];
    environment?: EnvironmentSetting;
    customRules?: string;
}

export interface Character {
    name: string;
    class: string;
    hp: number;
    maxHp: number;
    mana: number;
    maxMana: number;
    avatarSeed?: string;
    backstory?: string;
    inventory: Item[];
    equipment: Equipment;
    stats: Stats;
}

export interface Item {
    id: string;
    name: string;
    type: 'weapon' | 'armor' | 'accessory' | 'consumable' | 'misc';
    description: string;
    stats?: Partial<Stats>;
    icon?: string;
}

export interface Equipment {
    head?: Item;
    body?: Item;
    mainHand?: Item;
    offHand?: Item;
    accessory1?: Item;
    accessory2?: Item;
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
    customRules?: string;
    prompt?: string;
    classArchetypes?: string[];
    objectArchetypes?: string[];
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
