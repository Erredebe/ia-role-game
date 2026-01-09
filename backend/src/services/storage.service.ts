import * as fs from 'node:fs';
import * as path from 'node:path';
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
    private readonly storagePath: string;

    constructor() {
        this.storagePath = process.env.GAME_SAVES_PATH
            ? path.resolve(process.env.GAME_SAVES_PATH)
            : path.resolve(process.cwd(), 'data', 'saves.json');
        this.loadFromDisk();
    }

    private loadFromDisk() {
        try {
            if (!fs.existsSync(this.storagePath)) return;
            const raw = fs.readFileSync(this.storagePath, 'utf-8');
            if (!raw) return;
            const parsed = JSON.parse(raw) as Record<string, StoredGame>;
            Object.entries(parsed || {}).forEach(([id, data]) => {
                if (data) {
                    this.saves.set(id, data);
                }
            });
        } catch (error) {
            console.error('Error loading saves from disk', error);
        }
    }

    private persistToDisk() {
        try {
            const dir = path.dirname(this.storagePath);
            fs.mkdirSync(dir, { recursive: true });
            const payload = Object.fromEntries(this.saves.entries());
            fs.writeFileSync(this.storagePath, JSON.stringify(payload, null, 2), 'utf-8');
        } catch (error) {
            console.error('Error saving games to disk', error);
        }
    }

    async saveGame(id: string, data: GameState): Promise<void> {
        this.saves.set(id, {
            ...data,
            updatedAt: new Date().toISOString()
        });
        this.persistToDisk();
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
