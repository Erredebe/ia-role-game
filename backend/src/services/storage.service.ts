export class StorageService {
    private saves = new Map<string, any>();

    async saveGame(id: string, data: any): Promise<void> {
        this.saves.set(id, {
            ...data,
            updatedAt: new Date().toISOString()
        });
    }

    async loadGame(id: string): Promise<any | null> {
        return this.saves.get(id) || null;
    }

    async listGames(): Promise<any[]> {
        return Array.from(this.saves.entries()).map(([id, data]) => ({
            id,
            characterName: data.character?.name,
            characterClass: data.character?.class,
            updatedAt: data.updatedAt
        }));
    }
}
