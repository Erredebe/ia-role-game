import axios from 'axios';
import { AIAdapter } from './ai.adapter.js';
import { ChatMessage, GameAction } from '../interfaces/game.interface.js';

export class LMStudioService implements AIAdapter {
    private readonly baseUrl = process.env.LM_STUDIO_URL || 'http://localhost:1234/v1';

    async generateNarrative(history: ChatMessage[]): Promise<GameAction> {
        const systemPrompt: ChatMessage = {
            role: 'system',
            content: `Eres un Maestro de Calabozo experto. Tu objetivo es narrar una aventura de rol.
            IMPORTANTE: Debes responder EXCLUSIVAMENTE en formato JSON válido con la siguiente estructura:
            {
                "description": "Tu narrativa aquí",
                "suggestedActions": ["Acción 1", "Acción 2", "Acción 3"],
                "updatedState": {
                    "character": {
                        "hp": 0,
                        "inventory": []
                    }
                },
                "type": "narrative"
            }
            "hp" es un cambio relativo (ej: -10 por daño, 5 por curación).
            Mantén la narrativa inmersiva y emocionante.`
        };

        try {
            const response = await axios.post(`${this.baseUrl}/chat/completions`, {
                model: 'local-model',
                messages: [systemPrompt, ...history],
                temperature: 0.7,
                response_format: { type: 'json_object' }
            });

            const content = response.data.choices[0].message.content;
            return JSON.parse(content) as GameAction;
        } catch (error) {
            console.error('Error calling LM Studio:', error);
            return {
                type: 'narrative',
                description: 'La voz del destino se desvanece... (Error de conexión con la IA)',
                suggestedActions: ['Reintentar']
            };
        }
    }
}
