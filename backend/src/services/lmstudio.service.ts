import axios from 'axios';
import { AIAdapter } from './ai.adapter.js';
import { ChatMessage, GameAction, EnvironmentImage, EnvironmentSetting } from '../interfaces/game.interface.js';

export class LMStudioService implements AIAdapter {
    private readonly baseUrl = process.env.LM_STUDIO_URL || 'http://localhost:1234/v1';
    private readonly imageModel = process.env.LM_STUDIO_IMAGE_MODEL;

    async generateNarrative(history: ChatMessage[], environment?: EnvironmentSetting, currentSummary?: string): Promise<GameAction> {
        const environmentContext = environment
            ? `Ambientacion actual: ${environment.name}${environment.description ? `. ${environment.description}` : ''}.`
            : 'Ambientacion actual: generica.';

        const summaryContext = currentSummary
            ? `RESUMEN DE LO OCURRIDO HASTA AHORA: ${currentSummary}`
            : 'Inicio de la aventura.';

        const systemPrompt: ChatMessage = {
            role: 'system',
            content: `Eres un Maestro de Calabozo experto. Tu objetivo es narrar una aventura de rol.
            IMPORTANTE: Debes responder EXCLUSIVAMENTE en formato JSON valido con la siguiente estructura:
            {
                "description": "Tu narrativa aqui",
                "suggestedActions": ["Accion 1", "Accion 2", "Accion 3"],
                "updatedState": {
                    "character": {
                        "hp": 0,
                        "inventory": []
                    }
                },
                "updatedSummary": "Resumen actualizado de la historia en 1-2 frases incluyendo lo ultimo ocurrido.",
                "type": "narrative"
            }
            "hp" es un cambio relativo (ej: -10 por dano, 5 por curacion).
            "updatedSummary" debe condensar la historia previa + el nuevo evento para mantener el contexto a largo plazo.
            Manten la narrativa inmersiva y emocionante.`
        };

        const environmentMessage: ChatMessage = {
            role: 'system',
            content: `${environmentContext}\n${summaryContext}`
        };

        // Limit history to last 10 messages to save context window, trusting the summary
        const limitedHistory = history.slice(-10);

        try {
            const response = await axios.post(`${this.baseUrl}/chat/completions`, {
                model: 'dolphin3.0-llama3.1-8b',
                messages: [systemPrompt, environmentMessage, ...limitedHistory],
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
                description: 'La voz del destino se desvanece... (Error de conexion con la IA)',
                suggestedActions: ['Reintentar']
            };
        }
    }

    async generateEnvironmentImage(prompt: string): Promise<EnvironmentImage | null> {
        const payload: {
            prompt: string;
            model?: string;
            size?: string;
            response_format?: string;
        } = {
            prompt,
            size: '1024x1024',
            response_format: 'b64_json'
        };

        if (this.imageModel) {
            payload.model = this.imageModel;
        }

        try {
            const response = await axios.post(`${this.baseUrl}/images/generations`, payload);
            const imageData = response.data?.data?.[0];

            if (!imageData) {
                console.warn('LM Studio image generation returned empty data.');
                return null;
            }

            return {
                url: imageData.url,
                base64: imageData.b64_json,
                prompt
            };
        } catch (error: any) {
            console.error('Error calling LM Studio image generation:', error.message);
            return null;
        }
    }
}
