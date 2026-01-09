import { GameState } from '../interfaces/game.interface.js';

export interface StoredGame extends GameState {
    updatedAt: string;
}

export interface StoredGameListEntry {
    id: string;
    characterName?: string;
    characterClass?: string;
    updatedAt: string;
}

export class StorageService {
    private readonly saves = new Map<string, StoredGame>();

    async saveGame(id: string, data: GameState): Promise<void> {
        this.saves.set(id, {
            ...data,
            updatedAt: new Date().toISOString()
        });
    }

    async loadGame(id: string): Promise<StoredGame | null> {
        return this.saves.get(id) || null;
    }

    async listGames(): Promise<StoredGameListEntry[]> {
        return Array.from(this.saves.entries()).map(([id, data]) => ({
            id,
            characterName: data.character?.name,
            characterClass: data.character?.class,
            updatedAt: data.updatedAt
        }));
    }
}
