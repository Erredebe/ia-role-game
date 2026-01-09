/**
 * @deprecated This service is no longer used. All game saves are now managed
 * in localStorage on the frontend. This file is kept for backward compatibility
 * but should not be used in new code.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { GameState } from "../interfaces/game.interface.js";

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
    const configuredPath = process.env.GAME_SAVES_PATH;
    if (configuredPath) {
      this.storagePath = path.resolve(configuredPath);
    } else {
      const cwd = process.cwd();
      const cwdBase = path.basename(cwd).toLowerCase();
      const root = cwdBase === "backend" ? path.resolve(cwd, "..") : cwd;
      this.storagePath = path.resolve(root, "data", "saves.json");
    }
    this.loadFromDisk();
  }

  private loadFromDisk() {
    try {
      let targetPath = this.storagePath;
      if (!fs.existsSync(targetPath)) {
        const cwd = process.cwd();
        const fallbackPaths = [
          path.resolve(cwd, "data", "saves.json"),
          path.resolve(cwd, "backend", "data", "saves.json"),
        ].filter((p) => p !== targetPath);
        const existingFallback = fallbackPaths.find((p) => fs.existsSync(p));
        if (!existingFallback) return;
        targetPath = existingFallback;
      }

      const raw = fs.readFileSync(targetPath, "utf-8");
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, StoredGame>;
      Object.entries(parsed || {}).forEach(([id, data]) => {
        if (data) {
          this.saves.set(id, data);
        }
      });
    } catch (error) {
      console.error("Error loading saves from disk", error);
    }
  }

  private persistToDisk() {
    try {
      const dir = path.dirname(this.storagePath);
      fs.mkdirSync(dir, { recursive: true });
      const payload = Object.fromEntries(this.saves.entries());
      fs.writeFileSync(
        this.storagePath,
        JSON.stringify(payload, null, 2),
        "utf-8"
      );
    } catch (error) {
      console.error("Error saving games to disk", error);
    }
  }

  async saveGame(id: string, data: GameState): Promise<void> {
    this.saves.set(id, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
    this.persistToDisk();
  }

  async loadGame(id: string): Promise<StoredGame | null> {
    const cached = this.saves.get(id);
    if (cached) return cached;
    this.loadFromDisk();
    return this.saves.get(id) || null;
  }

  async listGames(): Promise<StoredGameListEntry[]> {
    if (this.saves.size === 0) {
      this.loadFromDisk();
    }
    return Array.from(this.saves.entries()).map(([id, data]) => ({
      id,
      characterName: data.character?.name,
      characterClass: data.character?.class,
      updatedAt: data.updatedAt,
    }));
  }
}
