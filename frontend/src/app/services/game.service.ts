import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GameState, ActionResponse, SystemAction } from '../interfaces/game';
import { firstValueFrom } from 'rxjs';
import { ThemeService } from './theme.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = 'http://localhost:3000/api/game';
  private readonly localStorageKey = 'ia-role-game-saves';
  
  // State using Angular Signals
  state = signal<GameState | null>(null);
  currentId = signal<string | null>(null);
  loading = signal<boolean>(false);

  constructor(
    private http: HttpClient,
    private themeService: ThemeService
  ) {}

  async listGames(): Promise<LocalSaveSummary[]> {
    const saves = this.readLocalSaves();
    return Object.values(saves)
      .filter(entry => entry && entry.state)
      .map(entry => ({
        id: entry.id,
        characterName: entry.characterName,
        characterClass: entry.characterClass,
        updatedAt: entry.updatedAt
      }))
      .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  }

  async createNewGame(character: any, environment?: any): Promise<{id: string, state: GameState}> {
    return this.withLoading(async () => {
      const response = await firstValueFrom(this.http.post<any>(`${this.apiUrl}/new`, { character, environment }));
      const id = response.id || response.sessionId;
      const state = response.state || response.gameState;

      if (!id || !state) {
        throw new Error('Respuesta invalida al crear partida');
      }

      this.applyState(id, state);
      return { id, state };
    });
  }

  async fetchState(id: string) {
    const localState = this.getLocalState(id);
    if (localState) {
      try {
        const response = await firstValueFrom(this.http.post<any>(`${this.apiUrl}/restore`, { id, state: localState }));
        const state = response.gameState || localState;
        this.applyState(id, state);
        return;
      } catch (error) {
        console.error('Error restoring state', error);
      }
    }

    try {
      const state = await firstValueFrom(this.http.get<GameState>(`${this.apiUrl}/${id}/state`));
      this.applyState(id, state);
    } catch (error) {
      console.error('Error fetching state', error);
    }
  }

  async sendAction(action: string) {
    const id = this.currentId();
    if (!id) throw new Error('No active session');

    return this.withLoading(async () => {
      const response = await firstValueFrom(this.http.post<ActionResponse>(`${this.apiUrl}/${id}/action`, { action }));
      this.applyState(id, response.gameState);
      return response;
    }).catch(error => {
      console.error('Error sending action', error);
      throw error;
    });
  }

  async performSystemAction(systemAction: SystemAction, targetId: string) {
    const id = this.currentId();
    if (!id) throw new Error('No active session');

    return this.withLoading(async () => {
      const payload = {
        action: '', // Not used for system actions but keeping schema
        type: 'system',
        systemAction,
        targetId
      };
      
      const response = await firstValueFrom(this.http.post<ActionResponse>(`${this.apiUrl}/${id}/action`, payload));
      this.applyState(id, response.gameState);
      return response;
    }).catch((error: any) => {
      console.error('Error performing system action', error);
      throw error;
    });
  }

  private applyState(id: string, state: GameState) {
    this.currentId.set(id);
    this.state.set(state);
    if (state.environment) {
      this.themeService.setTheme(state.environment.id);
    }
    this.saveLocalGame(id, state);
  }

  private async withLoading<T>(task: () => Promise<T>): Promise<T> {
    this.loading.set(true);
    try {
      return await task();
    } finally {
      this.loading.set(false);
    }
  }

  private readLocalSaves(): Record<string, LocalSaveEntry> {
    if (typeof localStorage === 'undefined') return {};
    try {
      const raw = localStorage.getItem(this.localStorageKey);
      return raw ? JSON.parse(raw) : {};
    } catch (error) {
      console.error('Error reading local saves', error);
      return {};
    }
  }

  private writeLocalSaves(saves: Record<string, LocalSaveEntry>) {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(this.localStorageKey, JSON.stringify(saves));
  }

  private saveLocalGame(id: string, state: GameState) {
    if (!id || !state) return;
    const saves = this.readLocalSaves();
    saves[id] = {
      id,
      characterName: state.character?.name || 'Sin nombre',
      characterClass: state.character?.class || 'Sin clase',
      updatedAt: new Date().toISOString(),
      state
    };
    this.writeLocalSaves(saves);
  }

  private getLocalState(id: string): GameState | null {
    const saves = this.readLocalSaves();
    return saves[id]?.state || null;
  }
}

interface LocalSaveEntry {
  id: string;
  characterName: string;
  characterClass: string;
  updatedAt: string;
  state: GameState;
}

export interface LocalSaveSummary {
  id: string;
  characterName: string;
  characterClass: string;
  updatedAt: string;
}
