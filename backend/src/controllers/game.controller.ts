import { Request, Response } from 'express';
import { LMStudioService } from '../services/lmstudio.service.js';
import { StorageService } from '../services/storage.service.js';
import { GameState, ChatMessage } from '../interfaces/game.interface.js';
import { v4 as uuidv4 } from 'uuid';

const aiService = new LMStudioService();
const storageService = new StorageService();

const normalizeEnvironment = (environment: any) => {
    if (!environment) return undefined;
    if (typeof environment === 'string') {
        return { id: environment, name: environment, description: '' };
    }
    return environment;
};

export const createNewGame = async (req: Request, res: Response) => {
    const { character, environment } = req.body;
    const resolvedEnvironment = normalizeEnvironment(environment);
    // Extraer customRules del environment si viene ahí, o del body si se envía separado
    const customRules = resolvedEnvironment?.customRules || req.body.customRules;
    
    const initialState: GameState = {
        character: {
            ...character,
            avatarSeed: character.avatarSeed,
            hp: character.hp || 100,
            maxHp: character.hp || 100,
            mana: character.mana || 50,
            maxMana: character.mana || 50,
            inventory: character.inventory || [],
            stats: character.stats || { strength: 10, dexterity: 10, intelligence: 10 }
        },
        location: 'El inicio de tu viaje',
        narrativeHistory: [],
        environment: resolvedEnvironment,
        customRules: customRules,
        narrativeSummary: 'La aventura comienza.'
    };

    const sessionId = uuidv4();
    
    // Generate initial narrative
    const environmentText = resolvedEnvironment
        ? `Ambientacion elegida: ${resolvedEnvironment.name}${resolvedEnvironment.description ? `. ${resolvedEnvironment.description}` : ''}.`
        : 'Ambientacion generica.';
    const rulesText = customRules ? `REGLAS TEMATICAS ESPECIALES DEL USUARIO: ${customRules}.` : '';
    const backstoryText = character?.backstory?.trim()
        ? `Trasfondo del personaje: ${character.backstory.trim()}.`
        : '';

    const greetingMsg: ChatMessage = { 
        role: 'system', 
        content: `El jugador ha creado un personaje: ${character.name}, un ${character.class}. 
        ${environmentText}
        ${rulesText}
        ${backstoryText}
        Comienza la aventura narrando su llegada al mundo o el inicio de su mision.` 
    };

    // Add system greeting to history
    initialState.narrativeHistory.push(greetingMsg);
    
    // Call AI to generate first narrative
    try {
        const result = await aiService.generateNarrative(initialState.narrativeHistory, initialState.environment, initialState.narrativeSummary);
        
        // Update summary
        if (result.updatedSummary) {
            initialState.narrativeSummary = result.updatedSummary;
        }
        
        // Add AI response (description) to history
        initialState.narrativeHistory.push({ role: 'assistant', content: result.description });

        await storageService.saveGame(sessionId, initialState);

        res.json({
            sessionId,
            narrative: result.description,
            suggestedActions: result.suggestedActions,
            gameState: initialState
        });
    } catch (error) {
        console.error('Error creating new game:', error);
        res.status(500).json({ error: 'Failed to create game session' });
    }
};

export const getGamesList = async (req: Request, res: Response) => {
    try {
        const games = await storageService.listGames();
        res.json(games);
    } catch (error) {
        res.status(500).json({ error: 'Failed to list games' });
    }
};

export const getGameState = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Session ID is required' });
    
    const state = await storageService.loadGame(id);
    if (!state) return res.status(404).json({ error: 'Game not found' });
    res.json(state);
};

export const handlePlayerAction = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { action, type, systemAction, targetId } = req.body; // type: 'narrative' | 'system'
    
    if (!id) return res.status(400).json({ error: 'Session ID is required' });

    const state = await storageService.loadGame(id);
    if (!state) return res.status(404).json({ error: 'Game not found' });

    // Handle System Actions (Deterministic)
    if (type === 'system') {
        const stateHelper = await import('../utils/state.helper.js');
        let result: { newState: GameState, logs: string[], success: boolean } | null = null;
        let actionDesc = '';

        if (systemAction === 'equip') {
            result = stateHelper.equipItem(state, targetId);
            actionDesc = `Equipar item`;
        } else if (systemAction === 'unequip') {
            result = stateHelper.unequipItem(state, targetId); // targetId here is the slot name
            actionDesc = `Desequipar item`;
        }

        if (result && result.success) {
            // Apply updates
            state.character = result.newState.character;
            
            // Add system log to history so AI knows what happened next turn
            const systemMsg = `[SISTEMA]: ${result.logs.join('. ')}`;
            state.narrativeHistory.push({ role: 'system', content: systemMsg });
            
            await storageService.saveGame(id, state);

            return res.json({
                narrative: result.logs.join('\n'), // Return the log as immediate feedback
                suggestedActions: [], // No new suggestions from system action
                gameState: state
            });
        } else {
            return res.status(400).json({ error: result ? result.logs.join(', ') : 'Accion invalida' });
        }
    }

    // Handle Narrative Actions (AI)
    // Add player action to history
    const userMessage: ChatMessage = { role: 'user', content: action };
    state.narrativeHistory.push(userMessage);

    // Call AI
    const result = await aiService.generateNarrative(state.narrativeHistory, state.environment, state.narrativeSummary);

    // Update summary if provided
    if (result.updatedSummary) {
        state.narrativeSummary = result.updatedSummary;
    }

    // Update state if AI recommended changes
    const { newState, logs } = await import('../utils/state.helper.js').then(m => m.applyStateUpdate(state, result.updatedState || {}));
    
    // Assign back to state (object reference needs to be kept or properties copied)
    state.character = newState.character;
    // We could just assign other props if applyStateUpdate handled them, currently it mostly handles character
    
    const hpLog = logs.join('\n');
    const finalDescription = result.description + (hpLog ? `\n\n--- [SISTEMA]\n${hpLog}` : '');

    // Add AI response to history
    state.narrativeHistory.push({ role: 'assistant', content: finalDescription });

    await storageService.saveGame(id, state);

    res.json({
        narrative: finalDescription,
        suggestedActions: result.suggestedActions,
        gameState: state
    });
};

export const resetGame = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Session ID is required' });
    // For now simple reload or delete? Let's just return 400 as it's handled differently now
    res.status(400).json({ message: 'Use Create New Game instead' });
};
