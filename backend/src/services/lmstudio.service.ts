import axios from 'axios';
import { AIAdapter } from './ai.adapter.js';
import { ChatMessage, GameAction, EnvironmentSetting } from '../interfaces/game.interface.js';

export class LMStudioService implements AIAdapter {
    private readonly baseUrl = process.env.LM_STUDIO_URL || 'http://localhost:1234/v1';

    private tryParseJson(content: string): GameAction | null {
        const raw = content.trim();

        if (!raw) return null;

        const jsonFence = raw.includes('```json');
        const anyFence = raw.includes('```');
        let candidate = raw;

        if (jsonFence) {
            candidate = raw.split('```json')[1]?.split('```')[0]?.trim() ?? '';
        } else if (anyFence) {
            candidate = raw.split('```')[1]?.split('```')[0]?.trim() ?? '';
        }

        try {
            return JSON.parse(candidate) as GameAction;
        } catch {
            // fallthrough to bracket search
        }

        const start = raw.indexOf('{');
        if (start === -1) return null;

        let depth = 0;
        for (let i = start; i < raw.length; i++) {
            const ch = raw[i];
            if (ch === '{') depth += 1;
            if (ch === '}') depth -= 1;
            if (depth === 0) {
                const slice = raw.slice(start, i + 1);
                try {
                    return JSON.parse(slice) as GameAction;
                } catch {
                    return null;
                }
            }
        }

        return null;
    }

    async generateNarrative(history: ChatMessage[], environment?: EnvironmentSetting, currentSummary?: string): Promise<GameAction> {
        const environmentContext = environment
            ? `Ambientacion actual: ${environment.name}${environment.description ? `. ${environment.description}` : ''}.`
            : 'Ambientacion actual: generica.';

        const guideContext = environment?.prompt
            ? `GUIA DE AMBIENTACION: ${environment.prompt}`
            : '';

        const classContext = environment?.classArchetypes?.length
            ? `CLASES COMUNES: ${environment.classArchetypes.join(', ')}.`
            : '';

        const objectContext = environment?.objectArchetypes?.length
            ? `OBJETOS COMUNES: ${environment.objectArchetypes.join(', ')}.`
            : '';

        const rulesContext = environment?.customRules
            ? `REGLAS DEL CAMPANA (IMPORTANTE): ${environment.customRules}`
            : '';

        const summaryContext = currentSummary
            ? `RESUMEN DE LO OCURRIDO HASTA AHORA: ${currentSummary}`
            : 'Inicio de la aventura.';

        const systemPrompt: ChatMessage = {
            role: 'system',
            content: `Eres un Maestro de Calabozo experto. Tu objetivo es narrar una aventura de rol.
            IMPORTANTE: Debes responder EXCLUSIVAMENTE en formato JSON valido con la siguiente estructura (sin texto adicional):
            {
                "description": "Tu narrativa aqui",
                "suggestedActions": ["Accion 1", "Accion 2", "Accion 3"],
                "updatedState": {
                    "character": {
                        "hp": -5,
                        "inventory": [{"name": "Espada", "type": "weapon"}],
                        "equipment": {"mainHand": {"name": "Espada", "type": "weapon"}}
                    }
                },
                "updatedSummary": "Resumen actualizado...",
                "type": "narrative"
            }
            "hp" es un cambio relativo.
            IMPORTANTISIMO:
            1. Si el inventario cambia, devuelve la LISTA COMPLETA nueva (anade lo nuevo, quita lo que ya no esta).
            2. Si se EQUIPA algo, debe aparecer en "equipment" (slot correspondiente) Y desaparecer de "inventory" (si estaba ahi).
            3. Si se DESEQUIPA, debe desaparecer de "equipment" (null) Y aparecer en "inventory".
            4. "updatedSummary" debe condensar la historia previa + el nuevo evento.
            5. Evita anacronismos: respeta la ambientacion, clases y objetos coherentes con el mundo.`
        };

        const environmentMessage: ChatMessage = {
            role: 'system',
            content: `${environmentContext}\n${guideContext}\n${classContext}\n${objectContext}\n${rulesContext}\n${summaryContext}`
        };

        // Limit history to last 10 messages to save context window, trusting the summary
        const limitedHistory = history.slice(-10);

        try {
            const payload = {
                model: 'dolphin3.0-llama3.1-8b',
                messages: [systemPrompt, environmentMessage, ...limitedHistory],
                temperature: 0.7,
                response_format: { type: 'json_object' }
            };

            let response;
            try {
                response = await axios.post(`${this.baseUrl}/chat/completions`, payload);
            } catch (requestError) {
                const fallbackPayload = { ...payload } as any;
                delete fallbackPayload.response_format;
                console.warn('JSON mode not supported, retrying without response_format.');
                response = await axios.post(`${this.baseUrl}/chat/completions`, fallbackPayload);
            }

            const content = response.data.choices[0].message.content;

            const parsed = this.tryParseJson(content);
            if (parsed) {
                if (!parsed.suggestedActions) parsed.suggestedActions = [];
                if (!parsed.updatedState) parsed.updatedState = {};
                return parsed;
            }

            console.warn('AI returned non-JSON content, attempting fallback:', content);
            return {
                type: 'narrative',
                description: content,
                suggestedActions: ['Continuar']
            };
        } catch (error: any) {
            console.error('Error calling LM Studio:', error.message);
            return {
                type: 'narrative',
                description: 'La voz del destino se desvanece... (Error de conexion con la IA)',
                suggestedActions: ['Reintentar']
            };
        }
    }
}
