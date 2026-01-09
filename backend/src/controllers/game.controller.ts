import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { LMStudioService } from "../services/lmstudio.service.js";
import {
  ChatMessage,
  GameState,
  SystemAction,
  Equipment,
} from "../interfaces/game.interface.js";
import { resolveEnvironment } from "../data/environment.presets.js";

const aiService = new LMStudioService();

const EQUIPMENT_SLOTS: Array<keyof Equipment> = [
  "head",
  "body",
  "mainHand",
  "offHand",
  "accessory1",
  "accessory2",
];

const normalizeEnvironment = (environment: any) =>
  resolveEnvironment(environment);

const isEquipmentSlot = (value: string): value is keyof Equipment =>
  EQUIPMENT_SLOTS.includes(value as keyof Equipment);

const buildInitialState = (
  character: any,
  environment: any,
  customRules?: string
): GameState => {
  const resolvedEnvironment = normalizeEnvironment(environment);
  const resolvedRules = resolvedEnvironment?.customRules || customRules;
  const fallbackAvatarConfig =
    character?.avatarSeed
      ? {
          seed: character.avatarSeed,
          name: character.name,
        }
      : undefined;

  const initialState: GameState = {
    character: {
      ...character,
      avatarConfig: character.avatarConfig ?? fallbackAvatarConfig,
      hp: character.hp || 100,
      maxHp: character.hp || 100,
      mana: character.mana || 50,
      maxMana: character.mana || 50,
      inventory: character.inventory || [],
      stats: character.stats || {
        strength: 10,
        dexterity: 10,
        intelligence: 10,
      },
    },
    location: "El inicio de tu viaje",
    narrativeHistory: [],
    narrativeSummary: "La aventura comienza.",
  };

  if (resolvedEnvironment) {
    initialState.environment = resolvedEnvironment;
  }
  if (resolvedRules !== undefined) {
    initialState.customRules = resolvedRules;
    if (initialState.environment) {
      initialState.environment.customRules = resolvedRules;
    }
  }

  return initialState;
};

const buildGreetingMessage = (
  character: any,
  environment?: any,
  customRules?: string
): ChatMessage => {
  const environmentText = environment
    ? `Ambientacion elegida: ${environment.name}${
        environment.description ? `. ${environment.description}` : ""
      }.`
    : "Ambientacion generica.";
  const rulesText = customRules
    ? `REGLAS TEMATICAS ESPECIALES DEL USUARIO: ${customRules}.`
    : "";
  const backstoryText = character?.backstory?.trim()
    ? `Trasfondo del personaje: ${character.backstory.trim()}.`
    : "";
  const inventoryText = Array.isArray(character?.inventory)
    ? `Inventario inicial: ${
        character.inventory.length
          ? character.inventory
              .map((item: any) =>
                typeof item === "string"
                  ? item
                  : item?.name || item?.id || "Item"
              )
              .join(", ")
          : "Vacio"
      }.`
    : "Inventario inicial: Vacio.";

  return {
    role: "system",
    content: `El jugador ha creado un personaje: ${character.name}, un ${character.class}. 
        ${environmentText}
        ${rulesText}
        ${backstoryText}
        ${inventoryText}
        Comienza la aventura narrando su llegada al mundo o el inicio de su mision.`,
  };
};

const appendSystemLog = (state: GameState, logs: string[]) => {
  if (!logs.length) return;
  const systemMsg = `[SISTEMA]: ${logs.join("\n")}`;
  state.narrativeHistory.push({ role: "system", content: systemMsg });
};

const ensureNarrativeState = (state: GameState) => {
  if (!state.narrativeSummary) state.narrativeSummary = "La aventura comienza.";
  if (!state.narrativeHistory) state.narrativeHistory = [];
};

const applySystemAction = async (
  state: GameState,
  systemAction: SystemAction,
  targetId: string
): Promise<{
  result: { newState: GameState; logs: string[]; success: boolean } | null;
  error?: string;
}> => {
  const stateHelper = await import("../utils/state.helper.js");
  let result: { newState: GameState; logs: string[]; success: boolean } | null =
    null;

  if (systemAction === "equip") {
    result = stateHelper.equipItem(state, targetId);
  } else if (systemAction === "unequip") {
    if (!isEquipmentSlot(targetId)) {
      return { result: null, error: "Slot invalido" };
    }
    result = stateHelper.unequipItem(state, targetId);
  }

  if (!result) {
    return { result: null, error: "Accion invalida" };
  }

  return { result };
};

export const createNewGame = async (req: Request, res: Response) => {
  const { character, environment, customRules } = req.body;
  const initialState = buildInitialState(character, environment, customRules);

  const sessionId = uuidv4();

  const greetingMsg = buildGreetingMessage(
    character,
    initialState.environment,
    initialState.customRules
  );
  initialState.narrativeHistory.push(greetingMsg);

  try {
    const result = await aiService.generateNarrative(
      initialState.narrativeHistory,
      initialState.environment,
      initialState.narrativeSummary
    );

    if (result.updatedSummary) {
      initialState.narrativeSummary = result.updatedSummary;
    }

    initialState.narrativeHistory.push({
      role: "assistant",
      content: result.description,
    });

    res.json({
      sessionId,
      narrative: result.description,
      suggestedActions: result.suggestedActions,
      gameState: initialState,
    });
  } catch (error) {
    console.error("Error creating new game:", error);
    res.status(500).json({ error: "Failed to create game session" });
  }
};

export const getGamesList = async (req: Request, res: Response) => {
  // Games are now managed in localStorage on the frontend
  // This endpoint is no longer needed
  res
    .status(404)
    .json({ error: "Game list management moved to frontend localStorage" });
};

export const getGameState = async (req: Request, res: Response) => {
  // Game state is now managed in localStorage on the frontend
  // This endpoint is no longer needed
  res
    .status(404)
    .json({ error: "Game state management moved to frontend localStorage" });
};

export const restoreGame = async (req: Request, res: Response) => {
  // Game restoration is now handled on the frontend with localStorage
  // This endpoint is no longer needed
  res
    .status(404)
    .json({ error: "Game restoration moved to frontend localStorage" });
};

export const resetGame = async (req: Request, res: Response) => {
  // Game reset is now handled on the frontend with localStorage
  // This endpoint is no longer needed
  res.status(404).json({ error: "Game reset moved to frontend localStorage" });
};

export const handlePlayerAction = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { action, type, systemAction, targetId } = req.body; // type: 'narrative' | 'system'

  if (!id) return res.status(400).json({ error: "Session ID is required" });

  // Get the current state from the request body
  const currentState = req.body.currentState as GameState | undefined;
  if (!currentState) {
    return res.status(400).json({ error: "Current game state is required" });
  }

  const state = currentState;

  if (type === "system") {
    if (!systemAction || !targetId) {
      return res
        .status(400)
        .json({ error: "System action and targetId are required" });
    }

    const { result, error } = await applySystemAction(
      state,
      systemAction,
      targetId
    );

    if (result && result.success) {
      state.character = result.newState.character;
      appendSystemLog(state, result.logs);

      return res.json({
        narrative: result.logs.join("\n"),
        suggestedActions: [],
        gameState: state,
      });
    }

    return res.status(400).json({
      error: result ? result.logs.join(", ") : error || "Accion invalida",
    });
  }

  const userMessage: ChatMessage = { role: "user", content: action };
  state.narrativeHistory.push(userMessage);

  const result = await aiService.generateNarrative(
    state.narrativeHistory,
    state.environment,
    state.narrativeSummary
  );

  if (result.updatedSummary) {
    state.narrativeSummary = result.updatedSummary;
  }

  const { newState, logs } = await import("../utils/state.helper.js").then(
    (m) =>
      m.applyStateUpdate(
        state,
        result.updatedState || {},
        result.stateChangeJustification
      )
  );
  state.character = newState.character;

  const systemLog = logs.join("\n");
  const finalDescription = result.description;

  state.narrativeHistory.push({ role: "assistant", content: finalDescription });
  if (systemLog) appendSystemLog(state, logs);

  res.json({
    narrative: finalDescription,
    suggestedActions: result.suggestedActions,
    gameState: state,
  });
};
