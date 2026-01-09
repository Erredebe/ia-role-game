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
    process.env.LM_STUDIO_MODEL || "openai/gpt-oss-20b";
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
      const parsed = JSON.parse(candidate) as GameAction;
      return this.mergeDuplicateDescriptions(candidate, parsed);
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
          const parsed = JSON.parse(slice) as GameAction;
          return this.mergeDuplicateDescriptions(slice, parsed);
        } catch {
          return null;
        }
      }
    }

    return null;
  }

  private mergeDuplicateDescriptions(
    raw: string,
    parsed: GameAction
  ): GameAction {
    const descriptionParts = this.extractDescriptionParts(raw);
    if (descriptionParts.length <= 1) return parsed;

    const merged = descriptionParts
      .map((part) => part.trim())
      .filter(Boolean)
      .join("\n\n");

    return {
      ...parsed,
      description: merged,
    };
  }

  private extractDescriptionParts(raw: string): string[] {
    const regex = /"description"\s*:\s*"((?:\\.|[^"\\])*)"/g;
    const parts: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(raw))) {
      const value = match[1] ?? "";
      try {
        parts.push(JSON.parse(`"${value}"`));
      } catch {
        parts.push(value);
      }
    }

    return parts;
  }

  private buildSystemPrompt(isFirstMessage: boolean = false): ChatMessage {
    const baseRules = `Eres un Experto Master de partidas de rol. Tu objetivo es narrar una aventura de rol épica e inmersiva.
Responderas siempre en castellano.

REGLAS CRÍTICAS DE CAMBIOS DE ESTADO:
=======================================
⚠️ NUNCA cambies HP, inventario, equipo u otros atributos SOLO porque sí.
⚠️ SOLO modifica el estado en estos casos JUSTIFICADOS:
  • El jugador fue atacado exitosamente → reduce su HP CON EXPLICACIÓN
  • El jugador encontró un objeto → agrega a inventario CON DESCRIPCIÓN
  • El jugador usa/consume un objeto → remueve CON EXPLICACIÓN
  • El jugador equipa/desequipa → mueve entre equipment e inventory
  • El jugador vende/descarta → remueve CON JUSTIFICACIÓN
  • El jugador gana una recompensa → añade CON CONTEXTO
⚠️ EN CASO DE DUDA, NO HAGAS EL CAMBIO. Es mejor no cambiar que cambiar sin razón.
⚠️ SIEMPRE proporciona explicación en la narrativa para cada cambio de estado.

ESTADO - INSTRUCCIONES TÉCNICAS:
=================================
- "hp" es un cambio RELATIVO (ej: -5 para quitar 5 HP)
- Si el inventario cambia, devuelve la LISTA COMPLETA (no parcial)
- Si equipa algo: aparece en "equipment" y desaparece de "inventory"
- Si desequipa: desaparece de "equipment" y aparece en "inventory"
- "updatedSummary" = historia condensada + nuevo evento (máximo 2-3 párrafos)
- Mantén coherencia: respeta la ambientación, clases y objetos`;

    const firstMessageInstructions = isFirstMessage
      ? `

PRIMER MENSAJE - INTRODUCCIÓN ÉPICA:
====================================
⭐ Este es el PRIMER MENSAJE de la aventura. DEBES EXPANDIR AMPLIAMENTE:

1. DESCRIBE LA ESCENA EN DETALLE:
   - ¿Dónde está exactamente el personaje? (ubicación específica)
   - ¿Qué ve, oye, huele? (detalles sensoriales)
   - ¿Qué objetos hay visibles?
   - ¿Hay personas/criaturas presentes?

2. EXPLICA LA SITUACIÓN ACTUAL:
   - ¿Cuál es el objetivo/misión que debe completar?
   - ¿Por qué está aquí?
   - ¿Está solo, con aliados, o en peligro?
   - ¿Hay una amenaza inmediata?

3. PRESENTA CONTEXTO EMOCIONAL:
   - ¿Es una misión urgente?
   - ¿Hay compañeros que contar con él?
   - ¿Cuál es el peligro/misterio?

4. SUGIERE ACCIONES PARA APRENDER MÁS SOBRE LA MISIÓN (⭐ MUY IMPORTANTE):
   - Sugerencias como "Interrogar al prisionero sobre los detalles"
   - "Leer la carta con las instrucciones completas"
   - "Hablar con el capitán para entender mejor la amenaza"
   - "Examinar el mapa de la zona donde ocurrirá la misión"
   - "Preguntarle a tu aliado qué sabe del objetivo"
   - Mínimo 2 de las 3 acciones sugeridas deben ser para obtener información sobre la misión
   - Hazlas ESPECÍFICAS y DIRECTAS, no genéricas

5. TAMAÑO MÍNIMO: Este primer mensaje debe ser SUSTANCIALMENTE más largo (4-5 párrafos)
   - Describe lo que el personaje ha vivido hasta aquí
   - Explica por qué está en esta misión
   - Presenta aliados o enemigos potenciales
   - Crea intriga: ¿hay secretos sobre la misión? ¿hay peligro mayor?

RECUERDA: El primer mensaje establece el TONO DE TODA LA AVENTURA. Hazlo épico, detallado y cautivador. Las acciones sugeridas DEBEN permitir al jugador profundizar en los detalles de su misión.`
      : "";

    return {
      role: "system",
      content: `${baseRules}${firstMessageInstructions}

FORMATO DE RESPUESTA - JSON VÁLIDO (sin texto adicional):
===========================================================
{
    "description": "Tu narrativa aqui - DETALLADA Y NARRATIVA",
    "suggestedActions": ["Acción específica 1", "Acción específica 2", "Acción específica 3"],
    "updatedState": {
        "character": {
            "hp": 0,
            "inventory": [],
            "equipment": {}
        }
    },
    "updatedSummary": "Resumen del evento...",
    "type": "narrative"
}`,
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
    // Detectar si es el primer mensaje (solo hay mensajes del sistema)
    const isFirstMessage = history.length <= 2; // Solo greeting + system messages

    const systemPrompt = this.buildSystemPrompt(isFirstMessage);
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
