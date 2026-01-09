import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GameState, ActionResponse, SystemAction } from '../interfaces/game';
import { firstValueFrom } from 'rxjs';
import { ThemeService } from './theme.service';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private apiUrl = 'http://localhost:3000/api/game';
  private readonly STORAGE_KEY = 'ia_game_saves';

  // State using Angular Signals
  state = signal<GameState | null>(null);
  currentId = signal<string | null>(null);
  loading = signal<boolean>(false);

  constructor(private http: HttpClient, private themeService: ThemeService) {}

  async listGames(): Promise<LocalSaveSummary[]> {
    try {
      const saves = this.getLocalSaves();
      const games = Object.entries(saves)
        .map(([id, save]) => ({
          id,
          characterName: save.character?.name || 'Sin nombre',
          characterClass: save.character?.class || 'Sin clase',
          updatedAt: save.updatedAt || new Date().toISOString(),
        }))
        .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
      console.log('Listed games from localStorage:', games);
      return games;
    } catch (error) {
      console.error('Error listing games', error);
      return [];
    }
  }

  async createNewGame(
    character: any,
    environment?: any
  ): Promise<{ id: string; state: GameState }> {
    return this.withLoading(async () => {
      console.log('Creating new game with character:', character.name);
      const response = await firstValueFrom(
        this.http.post<any>(`${this.apiUrl}/new`, { character, environment })
      );
      console.log('Backend response:', response);

      const id = response.id || response.sessionId;
      let state = response.state || response.gameState;
      const suggestedActions = response.suggestedActions || [];

      console.log('Extracted ID:', id);
      console.log('Extracted state:', state);
      console.log('Extracted actions:', suggestedActions);

      if (!id || !state) {
        console.error('Invalid response from backend');
        throw new Error('Respuesta invalida al crear partida');
      }

      // Agregar acciones sugeridas al estado
      state = {
        ...state,
        suggestedActions: suggestedActions,
      };

      // Save to localStorage
      console.log('Attempting to save to localStorage...');
      this.saveToLocalStorage(id, state);
      this.applyState(id, state);
      console.log('Game created and saved successfully');
      return { id, state };
    });
  }

  async fetchState(id: string) {
    try {
      // Load from localStorage instead of API
      const state = this.loadFromLocalStorage(id);
      if (state) {
        this.applyState(id, state);
      } else {
        // Fallback to API if not in localStorage
        const state = await firstValueFrom(this.http.get<GameState>(`${this.apiUrl}/${id}/state`));
        this.saveToLocalStorage(id, state);
        this.applyState(id, state);
      }
    } catch (error) {
      console.error('Error fetching state', error);
    }
  }

  async sendAction(action: string) {
    const id = this.currentId();
    const currentState = this.state();
    if (!id || !currentState) throw new Error('No active session');

    return this.withLoading(async () => {
      const payload = {
        action,
        currentState,
      };
      const response = await firstValueFrom(
        this.http.post<ActionResponse>(`${this.apiUrl}/${id}/action`, payload)
      );
      let newState = response.gameState;

      // Agregar acciones sugeridas al estado
      newState = {
        ...newState,
        suggestedActions: response.suggestedActions || [],
      };

      // Save updated state to localStorage
      this.saveToLocalStorage(id, newState);
      this.applyState(id, newState);
      return response;
    }).catch((error) => {
      console.error('Error sending action', error);
      throw error;
    });
  }

  async performSystemAction(systemAction: SystemAction, targetId: string) {
    const id = this.currentId();
    const currentState = this.state();
    if (!id || !currentState) throw new Error('No active session');

    return this.withLoading(async () => {
      const payload = {
        action: '',
        type: 'system',
        systemAction,
        targetId,
        currentState,
      };

      const response = await firstValueFrom(
        this.http.post<ActionResponse>(`${this.apiUrl}/${id}/action`, payload)
      );
      let newState = response.gameState;

      // Agregar acciones sugeridas al estado
      newState = {
        ...newState,
        suggestedActions: response.suggestedActions || [],
      };

      // Save updated state to localStorage
      this.saveToLocalStorage(id, newState);
      this.applyState(id, newState);
      return response;
    }).catch((error: any) => {
      console.error('Error performing system action', error);
      throw error;
    });
  }

  async saveCurrentGame(): Promise<boolean> {
    const id = this.currentId();
    const state = this.state();
    console.log(`saveCurrentGame called - id: ${id}, has state: ${!!state}`);
    if (!id || !state) {
      console.warn('Cannot save: missing id or state');
      return false;
    }

    try {
      this.saveToLocalStorage(id, state);
      return true;
    } catch (error) {
      console.error('Error saving game', error);
      return false;
    }
  }

  private saveToLocalStorage(id: string, state: GameState): void {
    try {
      const saves = this.getLocalSaves();

      // Store the state with update timestamp
      saves[id] = {
        ...state,
        updatedAt: new Date().toISOString(),
      } as any;

      // Serialize to JSON
      const jsonStr = JSON.stringify(saves);
      console.log(`Before localStorage.setItem - Size: ${jsonStr.length} bytes`);

      localStorage.setItem(this.STORAGE_KEY, jsonStr);
      console.log(`✓ Game saved to localStorage with ID: ${id}`);

      // Verify
      const verify = localStorage.getItem(this.STORAGE_KEY);
      if (verify) {
        const parsed = JSON.parse(verify);
        console.log(`✓ Verified: ${Object.keys(parsed).length} games in storage`);
      }
    } catch (error) {
      console.error('❌ Error saving to localStorage:', error);
      console.error('State:', state);
    }
  }

  private loadFromLocalStorage(id: string): GameState | null {
    const saves = this.getLocalSaves();
    return saves[id] || null;
  }

  private getLocalSaves(): Record<string, GameState & { updatedAt: string }> {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) {
        console.log('No saved games in localStorage');
        return {};
      }
      const parsed = JSON.parse(data);
      console.log(`Loaded ${Object.keys(parsed).length} saved games from localStorage`);
      return parsed;
    } catch (error) {
      console.error('Error reading from localStorage', error);
      return {};
    }
  }

  // Debug method to test localStorage directly
  testLocalStorage(): boolean {
    try {
      console.log('Testing localStorage...');
      const testKey = '__test_localStorage_' + Date.now();
      const testValue = 'test_value_' + Math.random();

      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      const success = retrieved === testValue;

      if (success) {
        localStorage.removeItem(testKey);
        console.log('✓ localStorage is working correctly');
        return true;
      } else {
        console.error('✗ localStorage value mismatch');
        return false;
      }
    } catch (error) {
      console.error('✗ localStorage error:', error);
      return false;
    }
  }

  private async withLoading<T>(task: () => Promise<T>): Promise<T> {
    this.loading.set(true);
    try {
      return await task();
    } finally {
      this.loading.set(false);
    }
  }

  private applyState(id: string, state: GameState): void {
    const normalizedState = this.normalizeAvatarConfig(state);
    this.currentId.set(id);
    this.state.set(normalizedState);
    // Set theme based on environment (default to dark if not specified)
    const theme = (normalizedState.environment as any)?.theme || 'dark';
    this.themeService.setTheme(theme);
  }

  private normalizeAvatarConfig(state: GameState): GameState {
    const character = state.character;
    if (!character || character.avatarConfig) {
      return state;
    }

    const avatarConfig = {
      seed: character.avatarSeed || character.name || 'avatar',
      name: character.name || undefined,
      classId: this.mapClassNameToId(character.class),
    };

    return {
      ...state,
      character: {
        ...character,
        avatarConfig,
      },
    };
  }

  private mapClassNameToId(className?: string): string | undefined {
    if (!className) return undefined;
    const normalized = className.trim().toLowerCase();
    const map: Record<string, string> = {
      guerrero: 'warrior',
      mago: 'mage',
      arquero: 'archer',
      picaro: 'rogue',
      soldado: 'soldier',
      hacker: 'hacker',
      piloto: 'pilot',
      investigador: 'investigator',
      medico: 'medic',
      mecanico: 'mechanic',
    };
    return map[normalized];
  }
}

export interface LocalSaveSummary {
  id: string;
  characterName: string;
  characterClass: string;
  updatedAt: string;
}
