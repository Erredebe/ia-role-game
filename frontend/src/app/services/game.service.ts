import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GameState, ActionResponse } from '../interfaces/game';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = 'http://localhost:3000/api/game';
  
  // State using Angular Signals
  state = signal<GameState | null>(null);
  loading = signal<boolean>(false);

  constructor(private http: HttpClient) {}

  async fetchState() {
    try {
      const state = await firstValueFrom(this.http.get<GameState>(`${this.apiUrl}/state`));
      this.state.set(state);
    } catch (error) {
      console.error('Error fetching state', error);
    }
  }

  async sendAction(action: string) {
    this.loading.set(true);
    try {
      const response = await firstValueFrom(this.http.post<ActionResponse>(`${this.apiUrl}/action`, { action }));
      this.state.set(response.gameState);
      return response;
    } catch (error) {
      console.error('Error sending action', error);
      throw error;
    } finally {
      this.loading.set(false);
    }
  }

  async resetGame() {
    try {
      const response = await firstValueFrom(this.http.post<{state: GameState}>(`${this.apiUrl}/reset`, {}));
      this.state.set(response.state);
    } catch (error) {
      console.error('Error resetting game', error);
    }
  }
}
