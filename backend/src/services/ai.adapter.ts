import { ChatMessage, GameAction } from '../interfaces/game.interface.js';

export interface AIAdapter {
    generateNarrative(history: ChatMessage[]): Promise<GameAction>;
}
