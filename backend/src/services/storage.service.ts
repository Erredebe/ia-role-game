import fs from 'fs/promises';
import path from 'path';

export class StorageService {
    private readonly filePath = path.join(process.cwd(), 'data', 'saves.json');

    async saveGame(id: string, data: any): Promise<void> {
        const saves = await this.readSaves();
        saves[id] = {
            ...data,
            updatedAt: new Date().toISOString()
        };
        await fs.writeFile(this.filePath, JSON.stringify(saves, null, 2));
    }

    async loadGame(id: string): Promise<any | null> {
        const saves = await this.readSaves();
        return saves[id] || null;
    }

    async listGames(): Promise<any[]> {
        const saves = await this.readSaves();
        return Object.entries(saves).map(([id, data]: [string, any]) => ({
            id,
            characterName: data.character?.name,
            characterClass: data.character?.class,
            updatedAt: data.updatedAt
        }));
    }

    private async readSaves(): Promise<Record<string, any>> {
        try {
            const content = await fs.readFile(this.filePath, 'utf-8');
            return JSON.parse(content);
        } catch (error) {
            return {};
        }
    }
}
