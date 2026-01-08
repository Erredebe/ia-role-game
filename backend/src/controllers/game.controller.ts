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
        narrativeSummary: 'La aventura comienza.'
    };

    const sessionId = uuidv4();
    
    // Generate initial narrative
    const environmentText = resolvedEnvironment
        ? `Ambientacion elegida: ${resolvedEnvironment.name}${resolvedEnvironment.description ? `. ${resolvedEnvironment.description}` : ''}.`
        : 'Ambientacion generica.';

    const greetingMsg: ChatMessage = { 
        role: 'system', 
        content: `El jugador ha creado un personaje: ${character.name}, un ${character.class}. 
        ${environmentText}
        Comienza la aventura narrando su llegada al mundo o el inicio de su mision.` 
    };
    
    const result = await aiService.generateNarrative([greetingMsg], resolvedEnvironment);
    initialState.narrativeHistory.push({ role: 'assistant', content: result.description });
    
    await storageService.saveGame(sessionId, initialState);

    res.json({ id: sessionId, state: initialState, suggestedActions: result.suggestedActions });
};

export const getGamesList = async (req: Request, res: Response) => {
    const games = await storageService.listGames();
    res.json(games);
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
    const { action } = req.body;
    
    if (!id) return res.status(400).json({ error: 'Session ID is required' });

    const state = await storageService.loadGame(id);
    if (!state) return res.status(404).json({ error: 'Game not found' });

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
    let hpLog = '';
    if (result.updatedState) {
        if (result.updatedState.character?.hp !== undefined) {
             const delta = result.updatedState.character.hp;
             state.character.hp = Math.max(0, Math.min(
                state.character.maxHp, 
                state.character.hp + delta
            ));
            if (delta !== 0) {
                hpLog = ` (${delta > 0 ? '+' : ''}${delta} HP)`;
            }
        }
        if (result.updatedState.character?.inventory) {
            const newItems = result.updatedState.character.inventory.map((item: any) => 
                typeof item === 'string' ? item : (item.name || item.item || JSON.stringify(item))
            );
            state.character.inventory = [...new Set([...state.character.inventory, ...newItems])];
        }
    }

    // Add HP info to description if changed
    const finalDescription = result.description + (hpLog ? `\n\n---${hpLog}` : '');

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
