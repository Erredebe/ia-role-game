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
  
  // State using Angular Signals
  state = signal<GameState | null>(null);
  currentId = signal<string | null>(null);
  loading = signal<boolean>(false);

  constructor(
    private http: HttpClient,
    private themeService: ThemeService
  ) {}

  async listGames(): Promise<LocalSaveSummary[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<LocalSaveSummary[]>(`${this.apiUrl}/list`)
      );
      const entries = Array.isArray(response) ? response : [];
      return entries
        .map(entry => ({
          id: entry.id,
          characterName: entry.characterName || 'Sin nombre',
          characterClass: entry.characterClass || 'Sin clase',
          updatedAt: entry.updatedAt
        }))
        .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    } catch (error) {
      console.error('Error listing games', error);
      return [];
    }
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

  async saveCurrentGame(): Promise<boolean> {
    const id = this.currentId();
    const state = this.state();
    if (!id || !state) return false;

    try {
      const response = await firstValueFrom(
        this.http.post<any>(`${this.apiUrl}/restore`, { id, state })
      );
      const savedState = response.gameState || state;
      this.applyState(id, savedState);
      return true;
    } catch (error) {
      console.error('Error saving game', error);
      return false;
    }
  }

  private applyState(id: string, state: GameState) {
    this.currentId.set(id);
    this.state.set(state);
    if (state.environment) {
      this.themeService.setTheme(state.environment.id);
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

}

export interface LocalSaveSummary {
  id: string;
  characterName: string;
  characterClass: string;
  updatedAt: string;
}
