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

  private buildSystemPrompt(isFirstMessage: boolean = false): ChatMessage {
    const baseRules = `Eres un Experto Master de partidas de rol. Tu objetivo es narrar una aventura de rol épica e inmersiva.
Responderas siempre en castellano.

REGLAS CRÍTICAS DE CAMBIOS DE ESTADO:
=======================================
⚠️ NUNCA cambies HP, inventario, equipo u otros atributos SOLO porque sí.
⚠️ SOLO modifica el estado en estos casos JUSTIFICADOS:
  • El jugador fue atacado exitosamente → reduce su HP CON EXPLICACIÓN
  • El jugador encontró un objeto → agrega a inventario CON DESCRIPCIÓN CLARA
  • El jugador usa/consume un objeto → remueve SOLO si lo mencionó explícitamente
  • El jugador equipa/desequipa → mueve entre equipment e inventory
  • El jugador vende/descarta → remueve SOLO si lo pidió o lo narró
  • El jugador gana una recompensa → añade CON CONTEXTO NARRATIVO CLARO
  • El jugador pierde un objeto → SOLO si fue atacado/robado/destruido en la narrativa

INVENTARIO - REGLAS ESPECIALES (⚠️⚠️⚠️ CRÍTICO):
==================================================
❌ NUNCA vacíes el inventario sin explicación EXPLÍCITA en la narrativa
❌ NUNCA modifiques el inventario a menos que el jugador lo haya mencionado O causado directamente
❌ NUNCA remuevas objetos "porque ya no los necesita"
❌ NUNCA cambies objetos de forma implícita o no explicada

✅ SI cambias el inventario, DEBE cumplir:
   1. El jugador pidió/causó el cambio DIRECTAMENTE
   2. La narrativa EXPLICA CLARAMENTE por qué cambió
   3. La explicación aparece en la descripción de forma DIRECTA

EJEMPLOS VÁLIDOS:
✓ "Encuentras una llave oxidada en el suelo → 'Ahora llevas la llave' → agregada al inventario"
✓ "Usas la poción para curarte → 'Bebes la poción agotada' → removida del inventario"
✓ "Equipas tu espada → 'Desenfundas tu espada' → se mueve a equipment"

EJEMPLOS INVÁLIDOS (NUNCA HAGAS ESTO):
✗ Vaciar el inventario sin razón
✗ "Dejas caer tus cosas" sin que el jugador lo pida
✗ Cambiar objetos porque "la narrativa lo necesita"
✗ Remover objetos sin explicación en el texto

⚠️ EN CASO DE DUDA, NO HAGAS EL CAMBIO. Es mejor no cambiar que cambiar sin razón.
⚠️ SIEMPRE proporciona explicación EXPLÍCITA en la narrativa para cada cambio de estado.

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

4. SUGIERE ACCIONES PARA APRENDER MÁS SOBRE LA MISIÓN (⭐ OBLIGATORIO):
   - DEBES proporcionar EXACTAMENTE 3 acciones sugeridas
   - Mínimo 2 de las 3 deben ser para obtener información sobre la misión
   - Ejemplos:
     * "Interrogar al prisionero sobre los detalles de la conspiración"
     * "Leer la carta con las instrucciones completas"
     * "Hablar con el capitán para entender mejor la amenaza"
     * "Examinar el mapa de la zona donde ocurrirá la misión"
     * "Preguntarle a tu aliado qué sabe del objetivo"
   - Hazlas ESPECÍFICAS y DIRECTAS, no genéricas
   - NUNCA devuelvas menos de 3 acciones

5. TAMAÑO MÍNIMO: Este primer mensaje debe ser SUSTANCIALMENTE más largo (4-5 párrafos)
   - Describe lo que el personaje ha vivido hasta aquí
   - Explica por qué está en esta misión
   - Presenta aliados o enemigos potenciales
   - Crea intriga: ¿hay secretos sobre la misión? ¿hay peligro mayor?

⚠️ RECUERDA: El primer mensaje establece el TONO DE TODA LA AVENTURA. Hazlo épico, detallado y cautivador. 
⚠️ OBLIGATORIO: Siempre incluye exactamente 3 acciones sugeridas en "suggestedActions".`
      : `

ACCIONES SUGERIDAS - OBLIGATORIO:
==================================
⚠️ SIEMPRE debes incluir 3 acciones sugeridas en "suggestedActions"
⚠️ Las acciones deben ser ESPECÍFICAS relacionadas con lo que acaba de suceder
⚠️ NUNCA devuelvas un array vacío de acciones`;

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
    "stateChangeJustification": {
        "inventory": "OBLIGATORIO si 'inventory' en updatedState cambió. Explica EXACTAMENTE por qué el jugador tiene menos/más items.",
        "hp": "OBLIGATORIO si 'hp' cambió. Explica qué le pasó al personaje (ataque, curación, etc)",
        "equipment": "OBLIGATORIO si 'equipment' cambió. Explica qué equipo se puso/quitó y por qué"
    },
    "type": "narrative"
}

⚠️⚠️⚠️ REGLA CRÍTICA DE VALIDACIÓN ⚠️⚠️⚠️:
Si cambias "inventory", DEBES incluir "stateChangeJustification.inventory" explicando por qué.
Sin esa justificación, el servidor RECHAZARÁ el cambio.
NUNCA intentes cambiar el inventario sin una razón EXPLÍCITA en la narrativa.`,
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
    // Asegurar que siempre hay acciones sugeridas
    const suggestedActions =
      payload.suggestedActions && payload.suggestedActions.length > 0
        ? payload.suggestedActions
        : ["Continuar", "Observar los alrededores", "Buscar más información"];

    return {
      ...payload,
      type: payload.type || "narrative",
      suggestedActions: suggestedActions,
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
