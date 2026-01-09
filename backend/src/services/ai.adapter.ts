import { ChatMessage, GameAction, EnvironmentSetting } from '../interfaces/game.interface.js';

export interface AIAdapter {
    generateNarrative(
        history: ChatMessage[],
        environment?: EnvironmentSetting,
        currentSummary?: string
    ): Promise<GameAction>;
}
