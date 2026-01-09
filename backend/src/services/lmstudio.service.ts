import axios from "axios";
import { AIAdapter } from "./ai.adapter.js";
import {
  ChatMessage,
  GameAction,
  EnvironmentSetting,
} from "../interfaces/game.interface.js";

export class LMStudioService implements AIAdapter {
  private readonly baseUrl =
    process.env.LM_STUDIO_URL || "http://localhost:1234/v1";
  private readonly model =
    process.env.LM_STUDIO_MODEL || "dolphin3.0-llama3.1-8b";
  private readonly historyLimit = 10;
  private jsonModeSupported = true;
  private jsonModeWarned = false;

  private parseJsonPayload(content: string): GameAction | null {
    const raw = content.trim();

    if (!raw) return null;

    const jsonFence = raw.includes("```json");
    const anyFence = raw.includes("```");
    let candidate = raw;

    if (jsonFence) {
      candidate = raw.split("```json")[1]?.split("```")[0]?.trim() ?? "";
    } else if (anyFence) {
      candidate = raw.split("```")[1]?.split("```")[0]?.trim() ?? "";
    }

    try {
      return JSON.parse(candidate) as GameAction;
    } catch {
      // fallthrough to bracket search
    }

    const start = raw.indexOf("{");
    if (start === -1) return null;

    let depth = 0;
    for (let i = start; i < raw.length; i++) {
      const ch = raw[i];
      if (ch === "{") depth += 1;
      if (ch === "}") depth -= 1;
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

  private buildSystemPrompt(): ChatMessage {
    return {
      role: "system",
      content: `Eres un Experto Master de partidas de rol. Tu objetivo es narrar una aventura de rol.
            Responderas siempre en castellano.      
            No quitarás vida ni añadirás objetos sin que el jugador lo pida explícitamente. a menos que la narrativa lo requiera.
            Todos los objetos, personajes y escenarios deben ser coherentes con una ambientación seleccionada.
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
            5. Evita anacronismos: respeta la ambientacion, clases y objetos coherentes con el mundo.`,
    };
  }

  private buildEnvironmentMessage(
    environment?: EnvironmentSetting,
    currentSummary?: string
  ): ChatMessage {
    const environmentContext = environment
      ? `Ambientacion actual: ${environment.name}${
          environment.description ? `. ${environment.description}` : ""
        }.`
      : "Ambientacion actual: generica.";

    const sections = [
      environmentContext,
      environment?.prompt ? `GUIA DE AMBIENTACION: ${environment.prompt}` : "",
      environment?.classArchetypes?.length
        ? `CLASES COMUNES: ${environment.classArchetypes.join(", ")}.`
        : "",
      environment?.objectArchetypes?.length
        ? `OBJETOS COMUNES: ${environment.objectArchetypes.join(", ")}.`
        : "",
      environment?.customRules
        ? `REGLAS DEL CAMPANA (IMPORTANTE): ${environment.customRules}`
        : "",
      currentSummary
        ? `RESUMEN DE LO OCURRIDO HASTA AHORA: ${currentSummary}`
        : "Inicio de la aventura.",
    ];

    return {
      role: "system",
      content: sections.filter(Boolean).join("\n"),
    };
  }

  private normalizeAction(payload: GameAction): GameAction {
    return {
      ...payload,
      type: payload.type || "narrative",
      suggestedActions: payload.suggestedActions || [],
      updatedState: payload.updatedState || {},
    };
  }

  private isJsonModeUnsupported(error: any): boolean {
    const message =
      error?.response?.data?.error?.message ||
      error?.response?.data?.message ||
      error?.message ||
      "";
    const payload = error?.response?.data || {};
    const combined = `${message} ${JSON.stringify(payload)}`.toLowerCase();
    return (
      combined.includes("response_format") ||
      combined.includes("json mode") ||
      combined.includes("json_object")
    );
  }

  async generateNarrative(
    history: ChatMessage[],
    environment?: EnvironmentSetting,
    currentSummary?: string
  ): Promise<GameAction> {
    const systemPrompt = this.buildSystemPrompt();
    const environmentMessage = this.buildEnvironmentMessage(
      environment,
      currentSummary
    );

    // Limit history to last messages to save context window, trusting the summary.
    const limitedHistory = history.slice(-this.historyLimit);

    try {
      const payload = {
        model: this.model,
        messages: [systemPrompt, environmentMessage, ...limitedHistory],
        temperature: 0.7,
      } as any;

      const payloadWithJson = this.jsonModeSupported
        ? { ...payload, response_format: { type: "json_object" } }
        : payload;

      let response;
      try {
        response = await axios.post(
          `${this.baseUrl}/chat/completions`,
          payloadWithJson
        );
      } catch (requestError) {
        if (this.jsonModeSupported) {
          try {
            response = await axios.post(
              `${this.baseUrl}/chat/completions`,
              payload
            );
            if (this.isJsonModeUnsupported(requestError)) {
              this.jsonModeSupported = false;
              if (!this.jsonModeWarned) {
                console.warn(
                  "LM Studio no soporta response_format; deshabilitando modo JSON."
                );
                this.jsonModeWarned = true;
              }
            }
          } catch {
            throw requestError;
          }
        } else {
          throw requestError;
        }
      }

      const content = response.data.choices[0].message.content;

      const parsed = this.parseJsonPayload(content);
      if (parsed) {
        return this.normalizeAction(parsed);
      }

      console.warn(
        "AI returned non-JSON content, attempting fallback:",
        content
      );
      return {
        type: "narrative",
        description: content,
        suggestedActions: ["Continuar"],
        updatedState: {},
      };
    } catch (error: any) {
      console.error("Error calling LM Studio:", error.message);
      return {
        type: "narrative",
        description:
          "La voz del destino se desvanece... (Error de conexion con la IA)",
        suggestedActions: ["Reintentar"],
        updatedState: {},
      };
    }
  }
}
