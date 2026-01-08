import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GameState, ActionResponse } from '../interfaces/game';
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

  async listGames() {
    return firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/list`));
  }

  async createNewGame(character: any, environment?: any): Promise<{id: string, state: GameState}> {
    this.loading.set(true);
    try {
      const response = await firstValueFrom(this.http.post<any>(`${this.apiUrl}/new`, { character, environment }));
      const id = response.id || response.sessionId;
      const state = response.state || response.gameState;

      if (!id || !state) {
        throw new Error('Respuesta invalida al crear partida');
      }

      this.currentId.set(id);
      this.state.set(state);
      if (state.environment) {
        this.themeService.setTheme(state.environment.id);
      }
      return { id, state };
    } finally {
      this.loading.set(false);
    }
  }

  async fetchState(id: string) {
    try {
      const state = await firstValueFrom(this.http.get<GameState>(`${this.apiUrl}/${id}/state`));
      this.currentId.set(id);
      this.state.set(state);
      if (state.environment) {
        this.themeService.setTheme(state.environment.id);
      }
    } catch (error) {
      console.error('Error fetching state', error);
    }
  }

  async sendAction(action: string) {
    const id = this.currentId();
    if (!id) throw new Error('No active session');

    this.loading.set(true);
    try {
      const response = await firstValueFrom(this.http.post<ActionResponse>(`${this.apiUrl}/${id}/action`, { action }));
      this.state.set(response.gameState);
      return response;
    } catch (error) {
      console.error('Error sending action', error);
      throw error;
    } finally {
      this.loading.set(false);
    }
  }

  async performSystemAction(systemAction: 'equip' | 'unequip', targetId: string) {
    const id = this.currentId();
    if (!id) throw new Error('No active session');

    this.loading.set(true);
    try {
      const payload = {
        action: '', // Not used for system actions but keeping schema
        type: 'system',
        systemAction,
        targetId
      };
      
      const response = await firstValueFrom(this.http.post<ActionResponse>(`${this.apiUrl}/${id}/action`, payload));
      this.state.set(response.gameState);
      return response;
    } catch (error: any) {
        console.error('Error performing system action', error);
        throw error;
    } finally {
        this.loading.set(false);
    }
  }
}
