import { Request, Response } from 'express';
import { LMStudioService } from '../services/lmstudio.service.js';
import { GameState, ChatMessage } from '../interfaces/game.interface.js';

// In-memory state for now
let currentGameState: GameState = {
    character: {
        name: 'Aventurero',
        class: 'Guerrero',
        hp: 100,
        maxHp: 100,
        mana: 50,
        maxMana: 50,
        inventory: ['Espada oxidada', 'Capa vieja'],
        stats: { strength: 10, dexterity: 10, intelligence: 10 }
    },
    location: 'Entrada de la Mazmorra',
    narrativeHistory: []
};

const aiService = new LMStudioService();

export const getGameState = (req: Request, res: Response) => {
    res.json(currentGameState);
};

export const handlePlayerAction = async (req: Request, res: Response) => {
    const { action } = req.body;
    
    // Add player action to history
    const userMessage: ChatMessage = { role: 'user', content: action };
    currentGameState.narrativeHistory.push(userMessage);

    // Call AI
    const result = await aiService.generateNarrative(currentGameState.narrativeHistory);

    // Update state if AI recommended changes
    if (result.updatedState) {
        if (result.updatedState.character?.hp !== undefined) {
             currentGameState.character.hp = Math.max(0, Math.min(
                currentGameState.character.maxHp, 
                currentGameState.character.hp + result.updatedState.character.hp
            ));
        }
        if (result.updatedState.character?.inventory) {
            currentGameState.character.inventory = [...new Set([...currentGameState.character.inventory, ...result.updatedState.character.inventory])];
        }
    }

    // Add AI response to history
    currentGameState.narrativeHistory.push({ role: 'assistant', content: result.description });

    res.json({
        narrative: result.description,
        suggestedActions: result.suggestedActions,
        gameState: currentGameState
    });
};

export const resetGame = (req: Request, res: Response) => {
    currentGameState = {
        character: {
            name: 'Aventurero',
            class: 'Guerrero',
            hp: 100,
            maxHp: 100,
            mana: 50,
            maxMana: 50,
            inventory: ['Espada oxidada', 'Capa vieja'],
            stats: { strength: 10, dexterity: 10, intelligence: 10 }
        },
        location: 'Entrada de la Mazmorra',
        narrativeHistory: []
    };
    res.json({ message: 'Game reset', state: currentGameState });
};
