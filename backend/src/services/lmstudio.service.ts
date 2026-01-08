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
                model: 'dolphin3.0-llama3.1-8b',
                messages: [systemPrompt, ...history],
                temperature: 0.7,
                // response_format: { type: 'json_object' }
            });

            const content = response.data.choices[0].message.content;
            
            // Clean content if it's wrapped in markdown code blocks
            let jsonContent = content;
            if (content.includes('```json')) {
                jsonContent = content.split('```json')[1].split('```')[0].trim();
            } else if (content.includes('```')) {
                jsonContent = content.split('```')[1].split('```')[0].trim();
            }

            try {
                return JSON.parse(jsonContent) as GameAction;
            } catch (parseError) {
                console.warn('AI returned non-JSON content, attempting fallback:', content);
                return {
                    type: 'narrative',
                    description: content,
                    suggestedActions: ['Continuar']
                };
            }
        } catch (error: any) {
            console.error('Error calling LM Studio:', error.message);
            return {
                type: 'narrative',
                description: 'La voz del destino se desvanece... (Error de conexión con la IA)',
                suggestedActions: ['Reintentar']
            };
        }
    }
}
