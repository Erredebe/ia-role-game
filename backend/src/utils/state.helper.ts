import { GameState, Item, Equipment } from '../interfaces/game.interface.js';

/**
 * Applies updates from the AI (partial GameState) to the current GameState.
 * Explicitly handles complex objects like Inventory and Equipment.
 */
export const applyStateUpdate = (currentState: GameState, updatedState: Partial<GameState>): { newState: GameState, logs: string[] } => {
    const newState = JSON.parse(JSON.stringify(currentState)); // Deep copy to avoid mutation issues
    const logs: string[] = [];

    if (!updatedState) return { newState, logs };

    // 1. Handle Character HP
    if (updatedState.character?.hp !== undefined) {
        const delta = updatedState.character.hp;
        // Apply delta (AI sends relative change usually, but sometimes absolute - logic below assumes relative if small, or check prompt)
        // Wait, prompt says: "hp" es un cambio relativo (ej: -10 por dano, 5 por curacion).
        
        const oldHp = newState.character.hp;
        newState.character.hp = Math.max(0, Math.min(
            newState.character.maxHp,
            oldHp + delta
        ));
        
        if (delta !== 0) {
            logs.push(`HP: ${delta > 0 ? '+' : ''}${delta} (${newState.character.hp}/${newState.character.maxHp})`);
        }
    }

    // 2. Handle Inventory
    // Strategy: If AI provides inventory, we assume it's the NEW list (taking into account items removed/added).
    // The AI prompt will be updated to instruct "inventory" should be the COMPLETE new list if changed.
    if (updatedState.character?.inventory) {
        // Normalize items in case they are strings
        const newInventory = updatedState.character.inventory.map((item: any) => 
            typeof item === 'string' ? { id: item, name: item, type: 'misc', description: '' } as Item : item
        );
        
        // Check for differences to log
        const oldNames = newState.character.inventory.map((i: Item) => i.name).sort();
        const newNames = newInventory.map((i: Item) => i.name).sort();
        
        if (JSON.stringify(oldNames) !== JSON.stringify(newNames)) {
             logs.push(`Inventario actualizado: ${newNames.join(', ') || 'Vacio'}`);
        }

        newState.character.inventory = newInventory;
    }

    // 3. Handle Equipment
    // Strategy: Merge updates. If AI sends "head": { ... }, replace head. 
    if (updatedState.character?.equipment) {
        if (!newState.character.equipment) newState.character.equipment = {};
        
        const equipmentUpdates = updatedState.character.equipment as Equipment; // Partial<Equipment> actually
        let eqChanged = false;

        for (const [slot, item] of Object.entries(equipmentUpdates)) {
            // If item is null/undefined in update, implies unequip? Or just ignore? 
            // Usually JSON won't have undefined keys. If explicit null, we unequip.
            // If it has object, we equip.
            
            // Allow null to clear slot
            if (item === null) {
                if (newState.character.equipment[slot as keyof Equipment]) {
                     newState.character.equipment[slot as keyof Equipment] = undefined;
                     logs.push(`Desequipado: ${slot}`);
                     eqChanged = true;
                }
            } else if (typeof item === 'object') {
                newState.character.equipment[slot as keyof Equipment] = item;
                logs.push(`Equipado ${slot}: ${item.name}`);
                eqChanged = true;
            }
        }
    }

    // 4. Handle other simple fields if necessary (mana, stats, etc - not strictly requested but good for future)
    if (updatedState.character?.mana !== undefined) {
         const delta = updatedState.character.mana;
         newState.character.mana = Math.max(0, Math.min(
            newState.character.maxMana, 
            newState.character.mana + delta
        ));
    }

    return { newState, logs };
};
